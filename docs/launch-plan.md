# EsportsLab — v1.0 Launch Plan

This reframes the MVP checklist in `esportshub-master-feature-breakdown.md` as a
**product launch**, not a feature grab-bag. The bar: on day one, a visitor should
believe this is a real company's product — polished, fast, and useful — even
though the coverage is narrow. Depth over breadth.

**Positioning:** "Liquipedia for India" — verified Indian esports data with a
Graphic Maker no competitor has.

---

## Launch scope: two games, two depths

| | BGMI (flagship) | Valorant (second title) |
|---|---|---|
| Depth | Full experience | Read-only coverage |
| Tournaments | ✅ list + detail | ✅ list + detail |
| Standings | ✅ BR points table (live) | ✅ group standings (W-L / map diff / round diff) |
| Match pages | ✅ full lobby placement + kills | ✅ map-by-map scores |
| Team/player pages | ✅ | ✅ (shared pages, both games) |
| Rankings | ✅ | — (post-launch) |
| Graphic Maker | ✅ BR points table maker | — (post-launch) |
| Community submissions | ✅ | ✅ (same Revision pipeline) |

Why this split: BGMI proves the full product loop (data in → verified → published
→ graphic out). Valorant proves the dual-schema architecture publicly and makes
the site feel like a platform, not a single-game fan page. Both schemas already
exist and are seeded — the H2H read-only pages are cheap to add.

**Chess and other carousel games stay "Coming soon."** A landing page teaser is
enough; shipping a third shallow game weakens the product story.

---

## What "decent website" means concretely (launch quality bar)

Non-features that ARE the product at launch:

1. **Design coherence** — every page uses the EL brand system (light theme, blue
   palette, shared header/footer). No page looks like admin scaffolding.
2. **Empty states everywhere** — "No tournaments yet. Submit one →" instead of
   blank sections. An early site is mostly empty; empty must look intentional.
3. **Real content at launch** — minimum 2 real BGMI tournaments + 1 real Valorant
   tournament backfilled by us (the founders) before anyone sees the site. Fake
   seed data never ships.
4. **Speed** — ISR on all public pages; Core Web Vitals green. Already the
   architecture; keep it true as pages get heavier.
5. **SEO from day one** — per-entity URLs, sitemap.xml, `schema.org/SportsEvent`
   JSON-LD on tournament/match pages, OpenGraph cards. Long-tail search is the
   entire growth model; it cannot be a "later."
6. **Legal/trust basics** — About page, contact, content-sourcing policy
   ("every stat links to its source"). This is the credibility pitch, visible.

---

## Milestones (each ends in a demoable state)

### M1 — Public read experience (both games)
The site works end-to-end for a visitor, with founder-entered data.
- Tournament list + detail pages (`/tournament/[slug]`), branching BR/H2H layout
- Match detail pages (`/match/[id]`), BR and H2H variants
- Team + player pages (shared across games)
- `/valorant` hub (mirror of `/bgmi` with H2H standings)
- Empty states, 404s, loading states on everything

### M2 — Admin can run the site
We can operate the product daily without touching the DB.
- Auth (Auth.js — Google OAuth) with USER/EDITOR/ADMIN roles
- `/admin`: create/edit tournaments, teams, players, enter results
- CSV paste for BR standings (papaparse → preview → confirm)
- On-demand `revalidatePath()` after every admin write

### M3 — Community can contribute
The wiki loop opens.
- Public submission forms (result / team / correction) → `Revision` rows
- `source_link` required, enforced in form + API
- Pending review queue in `/admin` with approve/reject
- Recent Changes page (public feed of approved edits)

### M4 — The differentiator + launch polish
- Points Table Maker (Konva.js): auto-filled from tournament data, recolor,
  export 1080×1080 / 1080×1920 with EL watermark
- "Generate Graphic" button on admin tournament page
- SEO pass (JSON-LD, sitemap, OG images), About/policy pages
- Backfill real tournament data, delete seed data
- Deploy to production (Cloudflare Pages + Neon), domain, uptime monitoring

**Launch = end of M4.** Each milestone is also a usable checkpoint — if timelines
slip, M1-M3 alone is a functioning (if quieter) product.

---

## Explicitly cut from v1.0 (unchanged from Phase 2/3 docs)

Brackets · prize pool tracker · transfers/rumors · trust tiers & auto-publish ·
diff view & rollback · search backend · predictions/fantasy · gamification ·
polls · stream directory · additional Graphic Maker templates · rankings +
Graphic Maker for Valorant.

The landing page already teases the vision; v1.0's job is to make the two-game
core undeniably solid.

---

## Current status (as of this writing)

- ✅ Schema (dual match system), migrations, seed data — both games
- ✅ Landing page (EL brand, light theme, carousel, search UI stub)
- ✅ `/bgmi` hub with live standings
- ✅ Shared header/footer components
- ⬜ Everything in M1 beyond the hubs — next up: tournament detail pages
