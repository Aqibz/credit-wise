import { usePersistentState } from "@/hooks/usePersistentState";

export type Role = "Owner" | "Admin" | "Branch Manager" | "Inventory Officer" | "Sales Officer" | "Viewer";

export type CurrentUser = {
  name: string;
  role: Role;
  branches: string[]; // allowed branch names; ["*"] = all branches
};

const DEFAULT_USER: CurrentUser = {
  name: "Ahmed Hassan",
  role: "Owner",
  branches: ["*"],
};

// Role -> permission keys (simple deny-by-default RBAC)
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  Owner: ["*"],
  Admin: ["*"],
  "Branch Manager": [
    "reports.view", "reports.export", "reports.schedule",
    "inventory.reports.view", "inventory.reports.export", "inventory.reports.schedule",
  ],
  "Inventory Officer": [
    "reports.view",
    "inventory.reports.view", "inventory.reports.export",
  ],
  "Sales Officer": ["reports.view"],
  Viewer: ["reports.view"],
};

export function useCurrentUser() {
  const [user, setUser] = usePersistentState<CurrentUser>("qcrm.currentUser", DEFAULT_USER);

  const perms = ROLE_PERMISSIONS[user.role] ?? [];
  const can = (key: string) => perms.includes("*") || perms.includes(key);
  const allBranches = user.branches.includes("*");
  const canAccessBranch = (branch: string) =>
    allBranches || branch === "All Branches" || user.branches.includes(branch);
  const scopeBranches = (all: string[]) =>
    allBranches ? all : all.filter((b) => b === "All Branches" || user.branches.includes(b));

  return { user, setUser, can, allBranches, canAccessBranch, scopeBranches };
}
