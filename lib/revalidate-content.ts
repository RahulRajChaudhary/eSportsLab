import { revalidatePath } from "next/cache";

// Every public page already carries `export const revalidate = 60`, so this
// isn't strictly required for correctness — it just makes an admin write
// show up immediately instead of after the ISR window.
export function revalidateTournament(gameSlug: string, slug: string) {
  revalidatePath("/");
  revalidatePath("/tournament");
  revalidatePath(`/tournament/${gameSlug}`);
  revalidatePath(`/tournament/${gameSlug}/${slug}`);
  revalidatePath(`/tournament/${gameSlug}/${slug}/standings`);
  revalidatePath(`/tournament/${gameSlug}/${slug}/finals`);
  revalidatePath(`/tournament/${gameSlug}/${slug}/stats`);
  if (gameSlug === "bgmi") revalidatePath("/bgmi");
}

export function revalidateTeam(slug: string) {
  revalidatePath("/");
  revalidatePath(`/team/${slug}`);
}

export function revalidatePlayer(slug: string) {
  revalidatePath(`/player/${slug}`);
}
