# Archived Frontend Components

- `components/LiveChatWidget.tsx`
  Original path: `resources/js/installem/components/LiveChatWidget.tsx`
  Reason: no active route import or shell wiring in the current frontend flow.
  Replacement: none; parked until chat/support parity requires it.

- `components/BundlesOffersView.tsx`
  Original path: `resources/js/installem/components/BundlesOffersView.tsx`
  Reason: not referenced by any active catalog route after the route cleanup pass.
  Replacement: none; route remains explicit and dedicated elsewhere.

- `components/MatrixPreviewView.tsx`
  Original path: `resources/js/installem/components/MatrixPreviewView.tsx`
  Reason: no current route import after explicit page routing.
  Replacement: none; revisit only if catalog matrix drilldown is restored.

- `components/RecordPaymentDialog.tsx`
  Original path: `resources/js/installem/components/RecordPaymentDialog.tsx`
  Reason: modal flow is not part of the current full-page payment route contract.
  Replacement: dedicated payment/receipt pages from `CreditWiseRoutePages`.

- `components/OpeningStockBulkPost.tsx`
  Original path: `resources/js/installem/components/OpeningStockBulkPost.tsx`
  Reason: no active inventory route wiring in the current app shell.
  Replacement: none; revisit if inventory bulk-post flow is restored.

- `components/ComingSoon.tsx`
  Original path: `resources/js/installem/components/ComingSoon.tsx`
  Reason: unknown production routes now fail explicitly through `RouteNotFoundPage` instead of a silent generic fallback.
  Replacement: `components/route-pages/RouteNotFoundPage.tsx`
