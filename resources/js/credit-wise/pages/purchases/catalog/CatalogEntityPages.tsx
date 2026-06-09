import { createLegacyEntityRoutePage } from "@/pages/common/createLegacyEntityRoutePage";

export const BrandsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/catalog").then((m) => m.brandsConfig));
export const CategoriesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/catalog").then((m) => m.categoriesConfig));
export const SubCategoriesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/catalog").then((m) => m.subCategoriesConfig));
export const VariantAttributesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/catalog").then((m) => m.variantAttributesConfig));
export const ProductsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/catalog").then((m) => m.productsConfig));
export const ProductVariantsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/catalog").then((m) => m.productVariantsConfig));
export const BundlesPage = createLegacyEntityRoutePage(() => import("@/lib/entities/catalog").then((m) => m.bundlesConfig));
export const CollectionsPage = createLegacyEntityRoutePage(() => import("@/lib/entities/catalog").then((m) => m.collectionsConfig));
export const PricingPlansPage = createLegacyEntityRoutePage(() => import("@/lib/entities/catalog").then((m) => m.pricingPlansConfig));
export const InstallmentMatrixPage = createLegacyEntityRoutePage(() => import("@/lib/entities/catalog").then((m) => m.installmentMatrixConfig));
