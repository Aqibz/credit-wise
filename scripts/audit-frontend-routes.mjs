import fs from "node:fs";

const baseUrl = process.env.FRONTEND_AUDIT_BASE_URL ?? "http://127.0.0.1:8000";
const cdpUrl = process.env.FRONTEND_AUDIT_CDP_URL ?? "http://127.0.0.1:9223";
const workerCount = Number(process.env.FRONTEND_AUDIT_WORKERS ?? 8);
const routeWaitMilliseconds = Number(process.env.FRONTEND_AUDIT_ROUTE_WAIT_MS ?? 500);
const navigationFiles = [
  "resources/js/credit-wise/apps/tenant/navigation.ts",
  "resources/js/credit-wise/apps/super-admin/navigation.ts",
];
const workflowRoutes = [
  "/customers/new",
  "/contracts/new",
  "/sales/invoices/new",
  "/purchases/orders/new",
  "/purchases/grn/new",
  "/purchases/returns/new",
  "/purchases/bills/new",
  "/purchases/payments/new",
  "/purchases/expenses/new",
  "/payments-received/new",
  "/purchases/suppliers/new",
  "/catalog/products/new",
  "/hr/employees/new",
  "/support/hp-cases/new",
  "/login",
];

const routes = [
  ...new Set([
    ...navigationFiles.flatMap((file) =>
      [...fs.readFileSync(file, "utf8").matchAll(/to:\s*"([^"]+)"/g)].map((match) => match[1]),
    ),
    ...workflowRoutes,
  ]),
];

const routeBatches = Array.from({ length: workerCount }, () => []);
routes.forEach((route, index) => routeBatches[index % workerCount].push(route));

const results = (await Promise.all(routeBatches.map(auditBatch))).flat();
const failures = results.filter((result) => !result.ok);

console.log(JSON.stringify({ tested: results.length, failures }, null, 2));
process.exitCode = failures.length > 0 ? 1 : 0;

async function auditBatch(batch) {
  const target = await fetch(`${cdpUrl}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" }).then((response) =>
    response.json(),
  );
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let nextId = 1;
  let events = [];

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
      return;
    }

    if (["Runtime.exceptionThrown", "Runtime.consoleAPICalled", "Network.responseReceived"].includes(message.method)) {
      events.push(message);
    }
  };

  await new Promise((resolve) => {
    socket.onopen = resolve;
  });

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = nextId++;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });

  await Promise.all(["Page.enable", "Runtime.enable", "Network.enable"].map((method) => send(method)));
  await send("Network.setCacheDisabled", { cacheDisabled: true });

  const batchResults = [];
  for (const route of batch) {
    events = [];
    await send("Page.navigate", { url: `${baseUrl}${route}` });
    await wait(routeWaitMilliseconds);

    const evaluation = await send("Runtime.evaluate", {
      expression:
        "JSON.stringify({ title: document.title, text: document.body?.innerText?.slice(0, 400), html: document.documentElement?.outerHTML?.length })",
      returnByValue: true,
    });
    const page = JSON.parse(evaluation.result.result.value || "{}");
    const exceptions = events.filter((event) => event.method === "Runtime.exceptionThrown");
    const errors = events.filter(
      (event) => event.method === "Runtime.consoleAPICalled" && event.params.type === "error",
    );
    const status = events
      .filter((event) => event.method === "Network.responseReceived" && event.params.type === "Document")
      .at(-1)?.params.response.status;
    const runtimeError = /runtime error|could not finish loading/i.test(page.text ?? "");

    batchResults.push({
      route,
      ok: status === 200 && exceptions.length === 0 && errors.length === 0 && !runtimeError && Boolean(page.html),
      status,
      title: page.title,
      exceptions: exceptions.map((event) => event.params.exceptionDetails.text),
      errors: errors.map((event) => event.params.args.map((argument) => argument.value ?? argument.description).join(" ")),
      runtimeError,
    });
  }

  socket.close();
  await fetch(`${cdpUrl}/json/close/${target.id}`);

  return batchResults;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
