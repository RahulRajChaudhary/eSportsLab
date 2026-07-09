"use client";

import { useActionState } from "react";

type DeleteState = { error?: string; success?: boolean };

// Shared by every admin delete flow (teams, players, tournaments, stages,
// matches, ...) — surfaces FK-constraint failures inline instead of letting
// them silently no-op or crash.
const VARIANT_CLASS = {
  danger: "border-red-200 text-red-600 hover:bg-red-50",
  neutral: "border-zinc-200 text-zinc-600 hover:border-blue-300 hover:text-blue-700",
};

export function DeleteButton({
  action,
  confirmMessage,
  label = "Delete",
  pendingLabel = "Working…",
  variant = "danger",
}: {
  action: (prevState: DeleteState, formData: FormData) => Promise<DeleteState>;
  confirmMessage: string;
  label?: string;
  pendingLabel?: string;
  variant?: "danger" | "neutral";
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${VARIANT_CLASS[variant]}`}
      >
        {pending ? pendingLabel : label}
      </button>
      {state.error && <p className="mt-1 max-w-xs text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
