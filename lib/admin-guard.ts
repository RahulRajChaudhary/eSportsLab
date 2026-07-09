import { auth } from "@/lib/auth";

// Defense-in-depth: the (protected) admin layout already blocks non-ADMIN
// page loads, but Server Actions are callable directly regardless of which
// page rendered them, so every mutating action re-checks here too.
export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return session.user;
}
