import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 lg:px-10">
                <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,520px)] lg:items-center">
                    <div className="hidden lg:block">
                        <div className="max-w-xl space-y-6">
                            <Link href="/" className="inline-flex items-center gap-4">
                                <div className="grid h-16 w-16 place-items-center rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_-30px_rgba(37,99,235,0.45)]">
                                    <img src="/creditwise-icon.png" alt="CreditWise icon" className="h-10 w-10 object-contain" />
                                </div>
                                <div>
                                    <div className="text-[32px] font-semibold tracking-tight text-slate-950">CreditWise</div>
                                    <div className="text-sm text-slate-500">Retail Credit Management System</div>
                                </div>
                            </Link>

                            <div className="space-y-4">
                                <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
                                    Multi-tenant access
                                </div>
                                <h2 className="text-5xl font-semibold tracking-tight text-slate-950">
                                    Clean sign-in flow for every tenant workspace.
                                </h2>
                                <p className="text-base leading-7 text-slate-500">
                                    Tenant-aware authentication should feel simple. Known workspaces go straight to login. Neutral entry points can ask for organization first.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-xl lg:max-w-none">
                        <div className="mb-6 flex items-center justify-center lg:hidden">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <div className="grid h-14 w-14 place-items-center rounded-3xl border border-slate-200 bg-white shadow-[0_16px_36px_-26px_rgba(37,99,235,0.45)]">
                                    <img src="/creditwise-icon.png" alt="CreditWise icon" className="h-9 w-9 object-contain" />
                                </div>
                                <div>
                                    <div className="text-2xl font-semibold tracking-tight text-slate-950">CreditWise</div>
                                    <div className="text-sm text-slate-500">Retail Credit Management System</div>
                                </div>
                            </Link>
                        </div>

                        <div className="w-full">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
