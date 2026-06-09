@php
    $content = match ((int) $status) {
        403 => ['Access restricted', 'You do not have permission to open this page.'],
        404 => ['Page not found', 'The page may have moved, been removed, or the address may be incorrect.'],
        419 => ['Session expired', 'Refresh the page and sign in again if CreditWise asks you to.'],
        429 => ['Too many requests', 'Wait a moment before trying the same action again.'],
        503 => ['Temporarily unavailable', 'CreditWise is undergoing maintenance or a required service is unavailable.'],
        default => ['We could not load this page', 'CreditWise encountered an unexpected problem while processing this request.'],
    };
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $status }} - CreditWise</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; padding: 24px; display: grid; place-items: center; color: #0f172a; background: radial-gradient(circle at 12% 18%, #075985 0, transparent 30%), radial-gradient(circle at 88% 82%, #78350f 0, transparent 28%), #020617; font-family: ui-sans-serif, system-ui, sans-serif; }
        main { width: min(1040px, 100%); overflow: hidden; display: grid; grid-template-columns: 1.3fr .7fr; border: 1px solid rgba(255,255,255,.12); border-radius: 32px; background: #fff; box-shadow: 0 32px 90px rgba(0,0,0,.45); }
        section, aside { padding: clamp(28px, 5vw, 56px); }
        aside { color: #fff; background: #0f172a; }
        .eyebrow { color: #0369a1; font-size: 11px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; }
        .status { display: inline-flex; margin-top: 14px; padding: 7px 11px; border-radius: 999px; color: #fff; background: #0284c7; font: 700 13px ui-monospace, monospace; }
        h1 { max-width: 620px; margin: 28px 0 14px; font-size: clamp(34px, 6vw, 58px); line-height: 1.05; letter-spacing: -.04em; }
        p { max-width: 650px; margin: 0; color: #475569; font-size: 16px; line-height: 1.75; }
        .note { margin-top: 24px; padding: 16px 18px; border: 1px solid #fde68a; border-radius: 16px; color: #78350f; background: #fffbeb; font-size: 14px; line-height: 1.6; }
        .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 30px; }
        a, button { min-height: 44px; padding: 0 18px; border: 1px solid #cbd5e1; border-radius: 12px; background: #fff; color: #334155; font: 700 14px ui-sans-serif, system-ui, sans-serif; text-decoration: none; cursor: pointer; }
        a { display: inline-flex; align-items: center; color: #fff; border-color: #020617; background: #020617; }
        .meta { margin-top: 22px; padding: 16px; border: 1px solid rgba(255,255,255,.1); border-radius: 16px; background: rgba(255,255,255,.05); }
        .meta small { display: block; margin-bottom: 8px; color: #94a3b8; font-size: 10px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
        .meta code { overflow-wrap: anywhere; color: #e2e8f0; font-size: 12px; line-height: 1.6; }
        aside p { color: #cbd5e1; font-size: 14px; }
        @media (max-width: 760px) { main { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
<main>
    <section>
        <div class="eyebrow">CreditWise status</div>
        <div class="status">Error {{ $status }}</div>
        <h1>{{ $content[0] }}</h1>
        <p>{{ $content[1] }}</p>
        <div class="note">Your data is safe. Retry once, then share the request reference with support if the issue continues.</div>
        <div class="actions">
            <a href="/">Go to dashboard</a>
            <button type="button" onclick="location.reload()">Try again</button>
            <button type="button" onclick="history.back()">Go back</button>
        </div>
    </section>
    <aside>
        <div class="eyebrow" style="color:#7dd3fc">Support details</div>
        <div class="meta"><small>Status</small><code>{{ $status }}</code></div>
        <div class="meta"><small>Page</small><code>{{ $path }}</code></div>
        @if ($requestId)
            <div class="meta"><small>Request reference</small><code>{{ $requestId }}</code></div>
        @endif
        <div class="meta">
            <small>If this keeps happening</small>
            <p>Contact support with the page address and request reference. Do not share passwords or payment credentials.</p>
        </div>
    </aside>
</main>
</body>
</html>
