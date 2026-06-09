import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { GenericErrorPage } from './credit-wise/shared/ui/core/GenericErrorPage';
import { ToastProvider } from './credit-wise/shared/ui/core/Toaster';

const appName = import.meta.env.VITE_APP_NAME || 'CreditWise';
const pages = import.meta.glob('./Pages/**/*.{js,jsx,ts,tsx}');
const rootRegistry = globalThis.__creditWiseReactRoots ??= new WeakMap();

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('CreditWise runtime error:', error, errorInfo);
    }

    render() {
        if (this.state.error) {
            return (
                <GenericErrorPage
                    status="500"
                    title="This screen could not finish loading"
                    message="CreditWise encountered an unexpected frontend problem."
                    detail="Refresh the page once. If the issue continues, contact support and include the page address."
                    path={window.location.pathname}
                />
            );
        }

        return this.props.children;
    }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        if (name === 'CreditWiseApp') {
            return import('./Pages/CreditWiseApp.jsx');
        }

        if (name === 'SuperAdminApp') {
            return import('./Pages/SuperAdminApp.jsx');
        }

        return resolvePageComponent(
            [
                `./Pages/${name}.jsx`,
                `./Pages/${name}.tsx`,
                `./Pages/${name}.js`,
                `./Pages/${name}.ts`,
            ],
            pages,
        );
    },
    setup({ el, App, props }) {
        const root = rootRegistry.get(el) ?? createRoot(el);
        rootRegistry.set(el, root);

        root.render(
            <AppErrorBoundary>
                <ToastProvider>
                    <App {...props} />
                </ToastProvider>
            </AppErrorBoundary>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
