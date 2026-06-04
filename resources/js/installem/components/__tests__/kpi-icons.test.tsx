import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Rocket, Heart } from "lucide-react";
import { KpiIcons, KpiIcon } from "@/components/kpi-icons";
import { StatCard } from "@/components/ui-kit";

const STROKE = "1.75";

function getSvg(container: HTMLElement) {
  const svg = container.querySelector("svg");
  if (!svg) throw new Error("no svg rendered");
  return svg;
}

describe("KPI icon stroke width = 1.75", () => {
  it("every KpiIcons preset renders stroke-width 1.75", () => {
    for (const [name, Preset] of Object.entries(KpiIcons)) {
      const { container, unmount } = render(<Preset />);
      const svg = getSvg(container);
      expect(
        svg.getAttribute("stroke-width"),
        `KpiIcons.${name} stroke-width`,
      ).toBe(STROKE);
      unmount();
    }
  });

  it("KpiIcon wrapper forces 1.75 on raw Lucide icons", () => {
    const { container } = render(<KpiIcon icon={Rocket} />);
    expect(getSvg(container).getAttribute("stroke-width")).toBe(STROKE);
  });

  it("KpiIcon wrapper allows explicit override", () => {
    const { container } = render(<KpiIcon icon={Rocket} strokeWidth={3} />);
    expect(getSvg(container).getAttribute("stroke-width")).toBe("3");
  });

  it("StatCard renders KpiIcons preset at 1.75", () => {
    const { container } = render(
      <StatCard label="Customers" value={42} icon={<KpiIcons.customers />} />,
    );
    expect(getSvg(container).getAttribute("stroke-width")).toBe(STROKE);
  });

  it("StatCard renders raw Lucide icon wrapped in KpiIcon at 1.75", () => {
    const { container } = render(
      <StatCard
        label="Hearts"
        value={7}
        icon={<KpiIcon icon={Heart} />}
      />,
    );
    expect(getSvg(container).getAttribute("stroke-width")).toBe(STROKE);
  });
});
