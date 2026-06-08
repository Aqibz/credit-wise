import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    build: {
        cssMinify: false,
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        hmr: {
            host: '127.0.0.1',
        },
    },
    resolve: {
        alias: [
            { find: /^@\/components\/ui\//, replacement: `${fileURLToPath(new URL('./resources/js/installem/shared/components/ui/', import.meta.url))}` },
            { find: /^@\/components\/forms\//, replacement: `${fileURLToPath(new URL('./resources/js/installem/shared/components/forms/', import.meta.url))}` },
            { find: /^@\/components\/layout\//, replacement: `${fileURLToPath(new URL('./resources/js/installem/layouts/tenant/', import.meta.url))}` },
            { find: /^@\/components\/settings\//, replacement: `${fileURLToPath(new URL('./resources/js/installem/pages/settings/', import.meta.url))}` },
            { find: /^@\/components\/route-pages\//, replacement: `${fileURLToPath(new URL('./resources/js/installem/pages/routes/', import.meta.url))}` },
            { find: /^@\/components\/customers\//, replacement: `${fileURLToPath(new URL('./resources/js/installem/pages/customers/', import.meta.url))}` },
            { find: '@/components/ContractsFunnelView', replacement: fileURLToPath(new URL('./resources/js/installem/pages/contracts/ContractsFunnelView.tsx', import.meta.url)) },
            { find: '@/components/DueInstallmentsView', replacement: fileURLToPath(new URL('./resources/js/installem/pages/payments/DueInstallmentsView.tsx', import.meta.url)) },
            { find: '@/components/AppearanceConfig', replacement: fileURLToPath(new URL('./resources/js/installem/pages/settings/components/AppearanceConfig.tsx', import.meta.url)) },
            { find: '@/components/ActivityRefLink', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/links/ActivityRefLink.tsx', import.meta.url)) },
            { find: '@/components/EntityPage', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/entity/EntityPage.tsx', import.meta.url)) },
            { find: '@/components/WizardPageShell', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/wizards/WizardPageShell.tsx', import.meta.url)) },
            { find: '@/components/StepWizard', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/wizards/StepWizard.tsx', import.meta.url)) },
            { find: '@/components/WidgetState', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/dashboard/WidgetState.tsx', import.meta.url)) },
            { find: '@/components/BundleForm', replacement: fileURLToPath(new URL('./resources/js/installem/components/catalog/BundleForm.tsx', import.meta.url)) },
            { find: '@/components/PlanLinkedItems', replacement: fileURLToPath(new URL('./resources/js/installem/components/catalog/PlanLinkedItems.tsx', import.meta.url)) },
            { find: '@/components/ProductMatrixCell', replacement: fileURLToPath(new URL('./resources/js/installem/components/catalog/ProductMatrixCell.tsx', import.meta.url)) },
            { find: '@/components/RequirementsCell', replacement: fileURLToPath(new URL('./resources/js/installem/components/catalog/RequirementsCell.tsx', import.meta.url)) },
            { find: '@/components/VariantMatrixCell', replacement: fileURLToPath(new URL('./resources/js/installem/components/catalog/VariantMatrixCell.tsx', import.meta.url)) },
            { find: '@/components/DocumentView', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/documents/DocumentView.tsx', import.meta.url)) },
            { find: '@/components/DocumentWizard', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/documents/DocumentWizard.tsx', import.meta.url)) },
            { find: '@/components/ExpectedDeliveryDialog', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/documents/ExpectedDeliveryDialog.tsx', import.meta.url)) },
            { find: '@/components/OpeningSaveMode', replacement: fileURLToPath(new URL('./resources/js/installem/components/inventory/OpeningSaveMode.tsx', import.meta.url)) },
            { find: '@/components/NewVendorModal', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/vendors/NewVendorModal.tsx', import.meta.url)) },
            { find: '@/components/SupplierLink', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/vendors/SupplierLink.tsx', import.meta.url)) },
            { find: '@/components/VendorDetailsSheet', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/vendors/VendorDetailsSheet.tsx', import.meta.url)) },
            { find: '@/components/ConfirmDialog', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/modals/ConfirmDialog.tsx', import.meta.url)) },
            { find: '@/components/NotifyDialog', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/modals/NotifyDialog.tsx', import.meta.url)) },
            { find: '@/components/Toaster', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/shared/Toaster.tsx', import.meta.url)) },
            { find: '@/components/ui-kit', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/shared/UiKit.tsx', import.meta.url)) },
            { find: '@/components/kpi-icons', replacement: fileURLToPath(new URL('./resources/js/installem/shared/components/shared/KpiIcons.tsx', import.meta.url)) },
            { find: /^@\/hooks\//, replacement: `${fileURLToPath(new URL('./resources/js/installem/shared/hooks/', import.meta.url))}` },
            { find: '@tanstack/react-router', replacement: fileURLToPath(new URL('./resources/js/installem/router-shim.tsx', import.meta.url)) },
            { find: '@', replacement: fileURLToPath(new URL('./resources/js/installem', import.meta.url)) },
        ],
    },
    plugins: [
        tailwindcss(),
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
});
