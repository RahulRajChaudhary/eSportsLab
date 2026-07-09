export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Appends -2, -3, ... on collision so admin-entered names (which won't
// always be pre-checked for uniqueness like seed data is) still produce a
// valid slug for the @unique column.
export async function uniqueSlug(name: string, exists: (slug: string) => Promise<boolean>) {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}
