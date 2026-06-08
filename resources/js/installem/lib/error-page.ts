type ErrorPageOptions = {
  code?: string | number;
  title?: string;
  message?: string;
  detail?: string;
};

export function renderErrorPage({
  code = "500",
  title = "CreditWise could not load this page",
  message = "Something went wrong while opening this screen.",
  detail = "This may be caused by a temporary server issue, database problem, or an unexpected application error.",
}: ErrorPageOptions = {}): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>CreditWise Error</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.6 Inter, system-ui, -apple-system, sans-serif; background: radial-gradient(circle at top, rgba(59,130,246,0.16), transparent 34%), linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%); color: #0f172a; min-height: 100vh; margin: 0; padding: 24px; }
      .wrap { max-width: 1080px; margin: 0 auto; min-height: calc(100vh - 48px); display: grid; align-items: center; }
      .grid { display: grid; gap: 24px; }
      @media (min-width: 960px) { .grid { grid-template-columns: 1.2fr 0.8fr; } }
      .card { border-radius: 32px; border: 1px solid rgba(226,232,240,.9); background: rgba(255,255,255,.92); padding: 32px; box-shadow: 0 30px 80px -35px rgba(15,23,42,.28); backdrop-filter: blur(12px); }
      .dark { background: #020617; color: #fff; box-shadow: 0 30px 80px -35px rgba(15,23,42,.45); }
      .badge { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; border: 1px solid #bae6fd; background: #f0f9ff; padding: 6px 12px; font-size: 11px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: #0369a1; }
      .code { border-radius: 999px; background: #0284c7; color: #fff; padding: 3px 8px; letter-spacing: normal; }
      h1 { font-size: 34px; line-height: 1.1; margin: 24px 0 12px; }
      p { color: #475569; margin: 0; }
      .detail { margin-top: 20px; border-radius: 20px; border: 1px solid #fde68a; background: rgba(254,249,195,.7); padding: 16px; color: #78350f; }
      .panel { border-radius: 20px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05); padding: 18px; }
      .meta { font-size: 11px; text-transform: uppercase; letter-spacing: .16em; color: #94a3b8; }
      .big { margin-top: 10px; font-size: 42px; font-weight: 700; color: #fff; }
      .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
      a, button { padding: 0 20px; height: 44px; border-radius: 14px; font: inherit; font-weight: 700; cursor: pointer; text-decoration: none; border: 1px solid transparent; display: inline-flex; align-items: center; justify-content: center; }
      .primary { background: #020617; color: #fff; }
      .secondary { background: #fff; color: #334155; border-color: #cbd5e1; }
      ul { margin: 12px 0 0; padding-left: 18px; color: #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="grid">
        <div class="card">
          <div class="badge">CreditWise <span class="code">${code}</span></div>
          <h1>${title}</h1>
          <p>${message}</p>
          <div class="detail">${detail}</div>
          <div class="actions">
            <a class="primary" href="/">Go to dashboard</a>
            <button class="secondary" onclick="location.reload()">Try again</button>
          </div>
        </div>
        <div class="card dark">
          <div class="meta">Error Snapshot</div>
          <div class="panel" style="margin-top:20px;">
            <div class="meta">Status Code</div>
            <div class="big">${code}</div>
          </div>
          <div class="panel" style="margin-top:18px;">
            <div class="meta">What the user can do</div>
            <ul>
              <li>Refresh the page after a few seconds.</li>
              <li>Return to the dashboard and reopen the flow.</li>
              <li>Contact support if the same issue keeps happening.</li>
            </ul>
          </div>
          <div class="panel" style="margin-top:18px; color:#dbeafe;">
            Dynamic server messages can later be injected here for database, auth, validation, or maintenance errors.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
