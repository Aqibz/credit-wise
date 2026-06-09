import { ChevronLeft, ChevronRight } from "lucide-react";

export function EntityPagination({
  filteredCount,
  visibleCount,
  page,
  totalPages,
  setPage,
}: {
  filteredCount: number;
  visibleCount: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
      <div className="font-medium text-muted-foreground">
        {filteredCount} record{filteredCount === 1 ? "" : "s"} - showing {visibleCount}
      </div>
      <div className="flex items-center gap-2">
        <span className="mr-2 font-medium text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === 1}
          onClick={() => setPage(Math.max(1, page - 1))}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-card px-3 font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .slice(0, 5)
          .map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={`grid h-9 w-9 place-items-center rounded-md font-semibold ${
                pageNumber === page
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              {pageNumber}
            </button>
          ))}
        <button
          disabled={page === totalPages}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-card px-3 font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
