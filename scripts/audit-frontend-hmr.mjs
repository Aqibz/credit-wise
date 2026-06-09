import fs from "node:fs";

const baseUrl = process.env.FRONTEND_AUDIT_BASE_URL ?? "http://127.0.0.1:8000";
const cdpUrl = process.env.FRONTEND_AUDIT_CDP_URL ?? "http://127.0.0.1:9223";
const route = process.env.FRONTEND_AUDIT_HMR_ROUTE ?? "/payments-received";
const refreshTarget = "resources/js/app.jsx";

const target = await fetch(`${cdpUrl}/json/new?${encodeURIComponent(`${baseUrl}${route}`)}`, {
  method: "PUT",
}).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
const runtimeFailures = [];
let nextId = 1;

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
    return;
  }

  if (message.method === "Runtime.exceptionThrown") {
    runtimeFailures.push(message.params.exceptionDetails.text);
  }

  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    runtimeFailures.push(
      message.params.args.map((argument) => argument.value ?? argument.description).join(" "),
    );
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

await Promise.all(["Page.enable", "Runtime.enable"].map((method) => send(method)));
await wait(1_500);

fs.utimesSync(refreshTarget, new Date(), new Date());
await wait(2_500);

const evaluation = await send("Runtime.evaluate", {
  expression: "JSON.stringify({ text: document.body?.innerText?.slice(0, 500), html: document.documentElement?.outerHTML?.length })",
  returnByValue: true,
});
const page = JSON.parse(evaluation.result.result.value || "{}");
const runtimeError = /runtime error|could not finish loading/i.test(page.text ?? "");
const passed = runtimeFailures.length === 0 && !runtimeError && Boolean(page.html);

console.log(JSON.stringify({ route, passed, runtimeFailures, runtimeError }, null, 2));

socket.close();
await fetch(`${cdpUrl}/json/close/${target.id}`);
process.exitCode = passed ? 0 : 1;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
