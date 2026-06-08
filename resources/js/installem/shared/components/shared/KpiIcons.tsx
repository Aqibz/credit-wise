import {
  Users, UserPlus, UserCheck, UserX,
  Package, Boxes, ShoppingCart, ShoppingBag, Tag, Tags,
  Wallet, Banknote, Coins, CreditCard, Receipt, DollarSign,
  TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Activity,
  Calendar, Clock, CheckCircle2, AlertCircle, AlertTriangle, XCircle,
  Truck, Building2, Store, Warehouse,
  FileText, ClipboardList, Bell, Star,
  type LucideIcon, type LucideProps,
} from "lucide-react";
import { forwardRef } from "react";

/**
 * KPI icon system — all icons rendered through this wrapper share the same
 * stroke width, line caps, and pixel size so StatCard rows look uniform.
 *
 * Sizing is still controlled by StatCard's `[&_svg]:h-[18px] [&_svg]:w-[18px]`
 * rule, but stroke-width is locked here.
 */
const KPI_STROKE = 1.75;

type Props = Omit<LucideProps, "ref"> & { icon: LucideIcon };

export const KpiIcon = forwardRef<SVGSVGElement, Props>(function KpiIcon(
  { icon: Icon, strokeWidth, ...rest },
  ref,
) {
  return (
    <Icon
      ref={ref}
      strokeWidth={strokeWidth ?? KPI_STROKE}
      absoluteStrokeWidth
      {...rest}
    />
  );
});

/**
 * Curated, named presets — use these in entity pages so the same concept
 * always picks the same glyph.
 *
 *   <StatCard icon={<KpiIcons.customers />} ... />
 */
function makePreset(Icon: LucideIcon) {
  return (props: LucideProps) => (
    <Icon strokeWidth={KPI_STROKE} absoluteStrokeWidth {...props} />
  );
}

export const KpiIcons = {
  // people
  customers:   makePreset(Users),
  newCustomer: makePreset(UserPlus),
  activeUser:  makePreset(UserCheck),
  inactiveUser:makePreset(UserX),
  // catalog
  product:     makePreset(Package),
  inventory:   makePreset(Boxes),
  cart:        makePreset(ShoppingCart),
  order:       makePreset(ShoppingBag),
  category:    makePreset(Tag),
  tags:        makePreset(Tags),
  // money
  wallet:      makePreset(Wallet),
  cash:        makePreset(Banknote),
  coins:       makePreset(Coins),
  card:        makePreset(CreditCard),
  invoice:     makePreset(Receipt),
  revenue:     makePreset(DollarSign),
  // metrics
  trendUp:     makePreset(TrendingUp),
  trendDown:   makePreset(TrendingDown),
  bars:        makePreset(BarChart3),
  line:        makePreset(LineChart),
  pie:         makePreset(PieChart),
  activity:    makePreset(Activity),
  // time / status
  calendar:    makePreset(Calendar),
  clock:       makePreset(Clock),
  success:     makePreset(CheckCircle2),
  info:        makePreset(AlertCircle),
  warning:     makePreset(AlertTriangle),
  error:       makePreset(XCircle),
  // ops
  delivery:    makePreset(Truck),
  branch:      makePreset(Building2),
  store:       makePreset(Store),
  warehouse:   makePreset(Warehouse),
  // misc
  document:    makePreset(FileText),
  task:        makePreset(ClipboardList),
  bell:        makePreset(Bell),
  star:        makePreset(Star),
} as const;

export type KpiIconName = keyof typeof KpiIcons;
