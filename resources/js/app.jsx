import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { GenericErrorPage } from './installem/shared/components/shared/GenericErrorPage';

const appName = import.meta.env.VITE_APP_NAME || 'CreditWise';

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
                    code="500"
                    title="CreditWise hit a runtime error"
                    message="This screen could not finish loading."
                    detail={String(this.state.error?.message || this.state.error || 'Unexpected frontend error')}
                />
            );
        }

        return this.props.children;
    }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        if (name !== 'CreditWiseApp') {
            throw new Error(`Unknown page: ${name}`);
        }

        return import('./Pages/CreditWiseApp.jsx');
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
