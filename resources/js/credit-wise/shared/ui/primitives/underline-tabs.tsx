import type { ReactNode } from "react";

export function UnderlineTab({
  active,
  onClick,
  children,
  refEl,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  refEl?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={refEl}
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors ${
        active
          ? "text-primary after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:bg-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function UnderlineTabBar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-nowrap items-center border-b border-border min-w-0 ${className}`}>{children}</div>
  );
}
