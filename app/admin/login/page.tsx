import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const session = await auth();
  if (session?.user) redirect(callbackUrl || "/admin");

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-24 text-center">
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
        EL Admin
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Admin and editor access only. Sign in with the Google account your role was granted to.
      </p>

      <form
        className="mt-8 w-full"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: callbackUrl || "/admin" });
        }}
      >
        <button
          type="submit"
          className="w-full rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
