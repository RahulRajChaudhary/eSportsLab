import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/admin/login");

  if (session.user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Not authorized</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Your account ({session.user.email}) doesn&apos;t have admin access. Ask the site
          admin if you think this is a mistake.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-6 py-10">
      <aside className="w-48 shrink-0 space-y-6">
        <Link href="/admin" className="block text-sm font-bold tracking-tight text-zinc-900">
          EL Admin
        </Link>
        <AdminSidebarNav />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm font-medium text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
