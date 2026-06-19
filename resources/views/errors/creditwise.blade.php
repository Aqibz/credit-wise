@php
    $content = match ((int) $status) {
        400 => ['Request could not be processed', 'CreditWise could not understand the request for this page.', 'Go to dashboard', '/dashboard', 'Request'],
        401 => ['Sign-in required', 'Your session is not authorized to access this page.', 'Go to login', '/login', 'Authentication'],
        403 => ['Access restricted', 'You do not have permission to open this page.'],
        404 => ['Page not found', 'The page may have moved, been removed, or the address may be incorrect.'],
        405 => ['Action not available', 'This page cannot handle the action that was just attempted.'],
        408 => ['Request timed out', 'The server took too long to complete this request.'],
        410 => ['This page is no longer available', 'The content you tried to open has been removed from this workspace.'],
        413 => ['Submitted content is too large', 'CreditWise cannot process the data or file size that was sent.'],
        414 => ['Address is too long', 'The page address or request path is longer than CreditWise can handle.'],
        419 => ['Session expired', 'Refresh the page and sign in again if CreditWise asks you to.'],
        422 => ['Something needs attention', 'The request could not be completed with the information that was submitted.'],
        429 => ['Too many requests', 'Wait a moment before trying the same action again.'],
        502 => ['Service connection failed', 'CreditWise could not complete this request because an upstream service returned an invalid response.'],
        503 => ['Temporarily unavailable', 'CreditWise is undergoing maintenance or a required service is unavailable.'],
        504 => ['Service took too long', 'CreditWise waited too long for a required service to respond.'],
        default => ['We could not load this page', 'CreditWise encountered an unexpected problem while processing this request.'],
    };
    $title = $content[0];
    $message = $content[1];
    $primaryLabel = $content[2] ?? 'Go to dashboard';
    $primaryHref = $content[3] ?? '/dashboard';
    $badge = $content[4] ?? match ((int) $status) {
        400 => 'Request',
        403 => 'Permissions',
        404 => 'Navigation',
        405 => 'Request',
        408 => 'Timeout',
        410 => 'Navigation',
        413 => 'Upload',
        414 => 'Navigation',
        419 => 'Session',
        422 => 'Validation',
        429 => 'Rate limit',
        502 => 'Service',
        503 => 'Maintenance',
        504 => 'Timeout',
        default => 'System',
    };
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $status }}</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; padding: 24px; display: grid; place-items: center; color: #0f172a; background: #fff; font-family: "Manrope", ui-sans-serif, system-ui, sans-serif; }
        body::before, body::after { content: ""; position: fixed; border-radius: 999px; filter: blur(90px); pointer-events: none; z-index: 0; }
        body::before { left: -80px; top: -60px; width: 320px; height: 320px; background: rgba(47,111,236,.12); }
        body::after { right: -120px; bottom: -80px; width: 400px; height: 400px; background: rgba(47,111,236,.08); }
        main { position: relative; z-index: 1; width: min(1120px, 100%); display: grid; grid-template-columns: minmax(0, 1.1fr) 360px; gap: 24px; }
        section, aside { border: 1px solid #e2e8f0; border-radius: 32px; background: #fff; box-shadow: 0 28px 60px -40px rgba(15,23,42,.3); }
        section { padding: clamp(28px, 5vw, 48px); }
        aside { padding: clamp(24px, 4vw, 32px); }
        .top { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
        .iconbox { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 18px; background: rgba(47,111,236,.1); }
        .iconbox img { width: 30px; height: 30px; object-fit: contain; }
        .eyebrow { color: rgba(47,111,236,.8); font-size: 10px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; }
        .sub { margin-top: 3px; color: #64748b; font-size: 14px; }
        .status { margin-left: auto; display: inline-flex; align-items: center; padding: 7px 12px; border: 1px solid #e2e8f0; border-radius: 999px; background: #f8fafc; color: #475569; font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
        .mark { width: 56px; height: 56px; margin: 26px 0 12px; object-fit: contain; }
        h1 { max-width: 720px; margin: 0 0 14px; font-size: clamp(34px, 6vw, 56px); line-height: 1.05; letter-spacing: -.04em; font-weight: 700; }
        p { max-width: 720px; margin: 0; color: #475569; font-size: 16px; line-height: 1.75; }
        .note { margin-top: 24px; padding: 16px 18px; border: 1px solid #e2e8f0; border-radius: 18px; color: #475569; background: #f8fafc; font-size: 14px; line-height: 1.65; }
        .actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 30px; }
        a, button { min-height: 44px; padding: 0 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; color: #334155; font: 700 14px "Manrope", ui-sans-serif, system-ui, sans-serif; text-decoration: none; cursor: pointer; }
        a.primary { display: inline-flex; align-items: center; justify-content: center; color: #fff; border-color: #2f6fec; background: #2f6fec; }
        .support-top { display:flex; align-items:center; gap:12px; }
        .support-icon { display:grid; place-items:center; width:40px; height:40px; border-radius:16px; background:#f1f5f9; color:#334155; font-size:18px; }
        .meta { margin-top: 14px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 18px; background: #fff; }
        .meta small { display: block; margin-bottom: 8px; color: #94a3b8; font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
        .meta code { overflow-wrap: anywhere; color: #0f172a; font-size: 12px; line-height: 1.6; }
        .tip { margin-top: 18px; padding: 18px; border: 1px solid #e2e8f0; border-radius: 18px; background: #f8fafc; }
        .tip strong { color:#0f172a; font-size:14px; }
        .tip p { margin-top: 8px; color:#64748b; font-size:14px; line-height:1.65; }
        @media (max-width: 880px) { main { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
<main>
    <section>
        <div class="top">
            <div class="iconbox"><img src="/creditwise-icon.png" alt="CreditWise icon"></div>
            <div>
                <div class="eyebrow">CreditWise</div>
                <div class="sub">{{ $badge }}</div>
            </div>
            <div class="status">{{ $status == 'offline' ? 'Offline' : 'Error '.$status }}</div>
        </div>
        <img src="/creditwise-icon.png" alt="CreditWise icon" class="mark">
        <h1>{{ $title }}</h1>
        <p>{{ $message }}</p>
        <div class="note">Your data is safe. Retry once, then share the request reference with support if the issue continues.</div>
        <div class="actions">
            <a href="{{ $primaryHref }}" class="primary">{{ $primaryLabel }}</a>
            <button type="button" onclick="location.reload()">Try again</button>
            <button type="button" onclick="history.back()">Go back</button>
        </div>
    </section>
    <aside>
        <div class="support-top">
            <div class="support-icon">?</div>
            <div>
                <div class="eyebrow" style="color:#94a3b8">Support details</div>
                <div class="sub" style="margin-top:4px">Reference information</div>
            </div>
        </div>
        <div class="meta"><small>Status</small><code>{{ strtoupper((string) $status) }}</code></div>
        <div class="meta"><small>Page</small><code>{{ $path }}</code></div>
        @if ($requestId)
            <div class="meta"><small>Request reference</small><code>{{ $requestId }}</code></div>
        @endif
        <div class="tip">
            <strong>If this keeps happening</strong>
            <p>Contact support with the page address and request reference. Do not share passwords or payment credentials.</p>
        </div>
    </aside>
</main>
</body>
</html>
