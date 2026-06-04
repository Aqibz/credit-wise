import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const toastWarning = vi.fn();
vi.mock("sonner", () => ({
  toast: { warning: (...a: unknown[]) => toastWarning(...a), success: vi.fn(), error: vi.fn() },
}));

const navigateMock = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, search, onClick, onKeyDown, children, ...rest }: any) => (
    <a
      href={to}
      data-to={to}
      data-search={JSON.stringify(search ?? {})}
      onClick={(e) => { e.preventDefault(); onClick?.(e); }}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {children}
    </a>
  ),
  useNavigate: () => navigateMock,
}));

import { ActivityRefLink } from "@/components/ActivityRefLink";

beforeEach(() => {
  toastWarning.mockClear();
  navigateMock.mockClear();
});

describe("ActivityRefLink (shared deep-link)", () => {
  it("valid Adjustment ref → renders link with q, no toast on click", () => {
    render(<ActivityRefLink type="Adjustment" ref="ADJ-1002" />);
    const a = screen.getByRole("link");
    expect(a.getAttribute("data-to")).toBe("/inventory/adjustments");
    expect(JSON.parse(a.getAttribute("data-search")!)).toEqual({ tab: "adjustments", q: "ADJ-1002" });
    fireEvent.click(a);
    expect(toastWarning).not.toHaveBeenCalled();
  });

  it("invalid Transfer ref → click fires toast + navigates with no q", () => {
    render(<ActivityRefLink type="Transfer" ref="" />);
    fireEvent.click(screen.getByRole("link"));
    expect(toastWarning).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith({ to: "/inventory/transfers", search: {} });
  });

  it("invalid Audit ref → Space key fires toast + navigates", () => {
    render(<ActivityRefLink type="Audit" ref="   " />);
    fireEvent.keyDown(screen.getByRole("link"), { key: " " });
    expect(toastWarning).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/inventory/adjustments",
      search: { tab: "audit" },
    });
  });

  it("unsupported type (Inward) → renders plain text, no link", () => {
    render(<ActivityRefLink type="Inward" ref="GRN-2210" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("GRN-2210")).toBeTruthy();
  });
});
