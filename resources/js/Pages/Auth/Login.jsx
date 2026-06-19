import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

function StepPill({ index, label, active, complete }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={[
                    'grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition',
                    complete
                        ? 'bg-blue-600 text-white'
                        : active
                          ? 'border border-blue-200 bg-blue-50 text-blue-700'
                          : 'border border-slate-200 bg-white text-slate-400',
                ].join(' ')}
            >
                {complete ? '✓' : index}
            </div>
            <span className={active || complete ? 'text-sm font-medium text-slate-900' : 'text-sm text-slate-400'}>
                {label}
            </span>
        </div>
    );
}

export default function Login({ status, canResetPassword, uiOnlyAuth = false }) {
    const { tenant } = usePage().props;
    const resolvedTenant = tenant?.name ? tenant : null;
    const requiresWorkspaceStep = !resolvedTenant;

    const [workspaceStepComplete, setWorkspaceStepComplete] = useState(!requiresWorkspaceStep);
    const [workspaceId, setWorkspaceId] = useState(resolvedTenant?.slug ?? '');
    const [workspaceError, setWorkspaceError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [previewNotice, setPreviewNotice] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const workspaceDisplay = useMemo(() => {
        if (resolvedTenant?.name) {
            return resolvedTenant.name;
        }

        return workspaceId.trim();
    }, [resolvedTenant, workspaceId]);

    const submit = (e) => {
        e.preventDefault();

        if (!workspaceStepComplete) {
            const normalized = workspaceId.trim();

            if (!normalized) {
                setWorkspaceError('Enter your organization ID to continue.');
                return;
            }

            setWorkspaceError('');
            setWorkspaceStepComplete(true);
            return;
        }

        if (uiOnlyAuth) {
            setPreviewNotice('Login is disabled in this local UI-only build. Connect the auth database/backend to enable real sign-in.');
            return;
        }

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleWorkspaceChange = (value) => {
        setWorkspaceId(value);

        if (workspaceError) {
            setWorkspaceError('');
        }
    };

    const handleAuthFieldChange = (key, value) => {
        setData(key, value);

        if (previewNotice) {
            setPreviewNotice('');
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-700">
                        Retail Credit Management System
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-[30px] font-semibold tracking-tight text-slate-950">
                            {workspaceStepComplete ? 'Sign in to your workspace' : 'Find your workspace'}
                        </h1>
                        <p className="max-w-xl text-sm leading-6 text-slate-500">
                            {workspaceStepComplete
                                ? 'Use your account credentials to continue into CreditWise.'
                                : 'Enter your organization ID first. On tenant domains this step is skipped automatically.'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <StepPill index="1" label="Workspace" active={!workspaceStepComplete} complete={workspaceStepComplete} />
                    <div className="hidden h-px w-8 bg-slate-200 sm:block" />
                    <StepPill index="2" label="Login" active={workspaceStepComplete} complete={false} />
                </div>

                {status && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {status}
                    </div>
                )}

                {previewNotice && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                        {previewNotice}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    {!workspaceStepComplete ? (
                        <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.28)]">
                            <div className="space-y-1">
                                <label htmlFor="organization_id" className="text-sm font-medium text-slate-900">
                                    Organization ID
                                </label>
                                <p className="text-sm text-slate-500">
                                    This can be your tenant slug, company code, or workspace identifier.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <TextInput
                                    id="organization_id"
                                    type="text"
                                    name="organization_id"
                                    value={workspaceId}
                                    className="block h-11 w-full rounded-2xl border-slate-200 px-4 text-[15px] font-normal text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary/30"
                                    autoComplete="organization"
                                    placeholder="e.g. model-town-lahore"
                                    isFocused={true}
                                    onChange={(e) => handleWorkspaceChange(e.target.value)}
                                />
                                <InputError message={workspaceError} className="mt-2" />
                            </div>

                            <PrimaryButton className="h-11 w-full justify-center rounded-2xl bg-blue-600 text-sm font-medium hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800">
                                Continue
                            </PrimaryButton>
                        </div>
                    ) : (
                        <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.28)]">
                            <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Workspace
                                    </div>
                                    <div className="mt-1 text-sm font-medium text-slate-900">
                                        {workspaceDisplay || 'CreditWise'}
                                    </div>
                                </div>

                                {requiresWorkspaceStep ? (
                                    <button
                                        type="button"
                                        onClick={() => setWorkspaceStepComplete(false)}
                                        className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                                    >
                                        Change
                                    </button>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-slate-900">
                                    Email
                                </label>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block h-11 w-full rounded-2xl border-slate-200 px-4 text-[15px] font-normal text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary/30"
                                    autoComplete="username"
                                    placeholder="name@company.com"
                                    isFocused={true}
                                    onChange={(e) => handleAuthFieldChange('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <label htmlFor="password" className="text-sm font-medium text-slate-900">
                                        Password
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="block h-11 w-full rounded-2xl border-slate-200 px-4 pr-11 text-[15px] font-normal text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary/30"
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        onChange={(e) => handleAuthFieldChange('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((current) => !current)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <label className="flex items-center gap-3">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => handleAuthFieldChange('remember', e.target.checked)}
                                />
                                <span className="text-sm text-slate-500">
                                    Keep me signed in on this device
                                </span>
                            </label>

                            <PrimaryButton
                                className="h-11 w-full justify-center rounded-2xl bg-blue-600 text-sm font-medium hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800"
                                disabled={processing}
                            >
                                {uiOnlyAuth ? 'Preview login' : processing ? 'Signing in...' : 'Sign in'}
                            </PrimaryButton>
                        </div>
                    )}
                </form>
            </div>
        </GuestLayout>
    );
}
