import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Installem runtime error:', error, errorInfo);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="min-h-screen bg-background text-foreground p-6">
                    <div className="mx-auto max-w-3xl rounded-xl border border-destructive/30 bg-card p-5">
                        <h1 className="text-lg font-semibold text-destructive">Frontend runtime error</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            The app crashed while rendering. The message below is the actual browser error.
                        </p>
                        <pre className="mt-4 overflow-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap">
                            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        if (name !== 'InstallemApp') {
            throw new Error(`Unknown page: ${name}`);
        }

        return import('./Pages/InstallemApp.jsx');
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <AppErrorBoundary>
                <App {...props} />
            </AppErrorBoundary>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
