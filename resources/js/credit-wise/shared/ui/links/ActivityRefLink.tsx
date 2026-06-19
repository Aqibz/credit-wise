import { Link, useNavigate } from "@/shared/navigation";
import { toast } from "sonner";
import {
  safeResolveActivityLink,
  isValidRef,
  type ActivityType,
} from "@/lib/activity/activityLink";

type Tone = "default" | "muted";

export type ActivityRefLinkProps = {
  /** Activity kind. If a string outside ActivityType is passed (e.g. "Inward"),
   *  the component renders the ref as plain text - no link, no toast. */
  type: ActivityType | string;
  ref: unknown;
  /** Optional override label (defaults to the ref string, or "no ref"). */
  label?: string;
  className?: string;
  tone?: Tone;
  /** Optional aria-label override; defaults to "{type} {ref}". */
  ariaLabel?: string;
};

const SUPPORTED: ReadonlySet<ActivityType> = new Set<ActivityType>([
  "Adjustment",
  "Transfer",
  "Audit",
]);

function isSupported(t: string): t is ActivityType {
  return SUPPORTED.has(t as ActivityType);
}

/**
 * Unified Recent-Activity deep link with graceful fallback.
 *
 * - Valid ref -> navigates to the scoped list with `?q=<ref>`.
 * - Missing/invalid ref -> navigates to the list with no `q` and fires a
 *   warning toast.
 * - Unsupported activity type -> renders plain text (no navigation).
 *
 * Keyboard parity: anchors fire click on Enter natively; we add Space
 * handling so screen-reader / keyboard users get the same behavior.
 */
export function ActivityRefLink({
  type,
  ref,
  label,
  className,
  tone = "default",
  ariaLabel,
}: ActivityRefLinkProps) {
  const navigate = useNavigate();

  const valid = isValidRef(ref);
  const display = label ?? (valid ? String(ref).trim() : "no ref");

  // Unsupported type -> plain text. Keeps the column visually consistent
  // without inventing a navigation target the helper can't honor.
  if (!isSupported(type)) {
    return (
      <span
        className={
          className ??
          `font-bold ${tone === "muted" ? "text-muted-foreground" : "text-foreground"}`
        }
      >
        {display}
      </span>
    );
  }

  const target = safeResolveActivityLink(type, ref);

  const fireInvalid = () => {
    toast.warning("Reference missing or invalid", {
      description: `${type} record could not be located - opening the full list instead.`,
    });
    navigate({ to: target.to, search: target.search as any });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!valid) {
      e.preventDefault();
      fireInvalid();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== " " && e.key !== "Spacebar") return;
    e.preventDefault();
    if (valid) {
      navigate({ to: target.to, search: target.search as any });
    } else {
      fireInvalid();
    }
  };

  return (
    <Link
      to={target.to}
      search={target.search as any}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel ?? `${type} ${valid ? String(ref).trim() : "(no reference)"}`}
      className={
        className ??
        `font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ${
          valid ? "text-foreground" : "text-muted-foreground italic"
        }`
      }
    >
      {display}
    </Link>
  );
}
