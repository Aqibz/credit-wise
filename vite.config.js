import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version ?? ''),
    },
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
            { find: /^@\/components\/ui\//, replacement: `${fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/primitives/', import.meta.url))}` },
            { find: /^@\/components\/forms\//, replacement: `${fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/forms/', import.meta.url))}` },
            { find: /^@\/components\/layout\//, replacement: `${fileURLToPath(new URL('./resources/js/credit-wise/layouts/tenant/', import.meta.url))}` },
            { find: /^@\/Components\//, replacement: `${fileURLToPath(new URL('./resources/js/Components/', import.meta.url))}` },
            { find: /^@\/Layouts\//, replacement: `${fileURLToPath(new URL('./resources/js/Layouts/', import.meta.url))}` },
            { find: /^@\/components\/settings\//, replacement: `${fileURLToPath(new URL('./resources/js/credit-wise/pages/system/settings/', import.meta.url))}` },
            { find: /^@\/components\/customers\//, replacement: `${fileURLToPath(new URL('./resources/js/credit-wise/pages/sales/customers/', import.meta.url))}` },
            { find: /^@\/components\/hr\//, replacement: `${fileURLToPath(new URL('./resources/js/credit-wise/components/workforce/hr/', import.meta.url))}` },
            { find: /^@\/components\/contract-wizard\//, replacement: `${fileURLToPath(new URL('./resources/js/credit-wise/components/sales/contracts/', import.meta.url))}` },
            { find: /^@\/components\/hp-wizard\//, replacement: `${fileURLToPath(new URL('./resources/js/credit-wise/components/system/support/', import.meta.url))}` },
            { find: '@/components/ContractsFunnelView', replacement: fileURLToPath(new URL('./resources/js/credit-wise/pages/sales/contracts/ContractsFunnelView.tsx', import.meta.url)) },
            { find: '@/components/DueInstallmentsView', replacement: fileURLToPath(new URL('./resources/js/credit-wise/pages/sales/payments/DueInstallmentsView.tsx', import.meta.url)) },
            { find: '@/components/AppearanceConfig', replacement: fileURLToPath(new URL('./resources/js/credit-wise/pages/system/settings/components/AppearanceConfig.tsx', import.meta.url)) },
            { find: '@/components/ActivityRefLink', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/links/ActivityRefLink.tsx', import.meta.url)) },
            { find: '@/components/EntityPage', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/entity/EntityPage.tsx', import.meta.url)) },
            { find: '@/components/WizardPageShell', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/wizards/WizardPageShell.tsx', import.meta.url)) },
            { find: '@/components/StepWizard', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/wizards/StepWizard.tsx', import.meta.url)) },
            { find: '@/components/WidgetState', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/dashboard/WidgetState.tsx', import.meta.url)) },
            { find: '@/components/BundleForm', replacement: fileURLToPath(new URL('./resources/js/credit-wise/components/purchases/catalog/BundleForm.tsx', import.meta.url)) },
            { find: '@/components/PlanLinkedItems', replacement: fileURLToPath(new URL('./resources/js/credit-wise/components/purchases/catalog/PlanLinkedItems.tsx', import.meta.url)) },
            { find: '@/components/ProductMatrixCell', replacement: fileURLToPath(new URL('./resources/js/credit-wise/components/purchases/catalog/ProductMatrixCell.tsx', import.meta.url)) },
            { find: '@/components/RequirementsCell', replacement: fileURLToPath(new URL('./resources/js/credit-wise/components/purchases/catalog/RequirementsCell.tsx', import.meta.url)) },
            { find: '@/components/VariantMatrixCell', replacement: fileURLToPath(new URL('./resources/js/credit-wise/components/purchases/catalog/VariantMatrixCell.tsx', import.meta.url)) },
            { find: '@/components/DocumentView', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/documents/DocumentView.tsx', import.meta.url)) },
            { find: '@/components/DocumentWizard', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/documents/DocumentWizard.tsx', import.meta.url)) },
            { find: '@/components/ExpectedDeliveryDialog', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/documents/ExpectedDeliveryDialog.tsx', import.meta.url)) },
            { find: '@/components/OpeningSaveMode', replacement: fileURLToPath(new URL('./resources/js/credit-wise/components/purchases/inventory/OpeningSaveMode.tsx', import.meta.url)) },
            { find: '@/components/NewVendorModal', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/vendors/NewVendorModal.tsx', import.meta.url)) },
            { find: '@/components/SupplierLink', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/vendors/SupplierLink.tsx', import.meta.url)) },
            { find: '@/components/VendorDetailsSheet', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/vendors/VendorDetailsSheet.tsx', import.meta.url)) },
            { find: '@/components/ConfirmDialog', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/modals/ConfirmDialog.tsx', import.meta.url)) },
            { find: '@/components/NotifyDialog', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/modals/NotifyDialog.tsx', import.meta.url)) },
            { find: '@/components/Toaster', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/core/Toaster.tsx', import.meta.url)) },
            { find: '@/components/ui-kit', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/core/UiKit.tsx', import.meta.url)) },
            { find: '@/components/kpi-icons', replacement: fileURLToPath(new URL('./resources/js/credit-wise/shared/ui/core/KpiIcons.tsx', import.meta.url)) },
            { find: /^@\/hooks\//, replacement: `${fileURLToPath(new URL('./resources/js/credit-wise/shared/hooks/', import.meta.url))}` },
            { find: '@', replacement: fileURLToPath(new URL('./resources/js/credit-wise', import.meta.url)) },
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
