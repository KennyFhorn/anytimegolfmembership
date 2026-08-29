import type { UserRole } from "./types";

/**
 * The one piece of mutable state in demo mode: the role of the fixed demo
 * identity (member_1 / "demo-admin-profile"). Lives in its own module (no
 * imports from lib/auth.ts or lib/data/*) so lib/auth.ts and
 * lib/data/mock.ts can both read/write it without a circular import.
 */
let demoRole: UserRole = "admin";

export function getDemoRole(): UserRole {
  return demoRole;
}

export function setDemoRole(role: UserRole): void {
  demoRole = role;
}
