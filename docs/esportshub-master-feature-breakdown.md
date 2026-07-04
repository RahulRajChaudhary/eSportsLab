# EsportsLab.site — Master Feature Breakdown (every feature, small pieces, build approach)

Legend for **Priority**: 🔴 MVP (build first) · 🟡 Phase 2 (growth) · 🟢 Phase 3 (stickiness/polish)

---

## Module 1: Content Backbone

**Important architectural note:** Battle Royale games (BGMI, PUBG Mobile, Free Fire) and Head-to-Head games (Valorant, MOBAs, LoL) use genuinely different Match/standings shapes, not just optional fields on one shared table. See "Module 1a: Dual Match System" below — build that schema first, since everything else in this module depends on it.

| Feature | What it does | Data needed | Build approach | Priority |
|---|---|---|---|---|
| Game hub pages | Landing page per game (`/bgmi`, `/valorant`...) showing latest tournaments, news, rankings for that game | `Game` table (slug, name, logo, `format_type`) | Static/ISR page, query top N tournaments/news filtered by `game_id` | 🔴 |
| Tournament list page | Browse/filter all tournaments by game, tier, status (upcoming/ongoing/completed) | `Tournament` table | Paginated query, filter dropdowns (client-side or query params) | 🔴 |
| Tournament detail page | Overview, format, dates, prize pool, organizer, participating teams | `Tournament`, join `Team` | Single dynamic route `/tournament/[slug]`, ISR with on-demand revalidation | 🔴 |
| Interactive bracket (H2H games only) | Clickable single/double-elim bracket showing match progression | `H2HMatch` table with `stage`, `round`, `next_match_id` links | Build a bracket-rendering component; each match node links to `/match/[id]` | 🟡 |
| BR standings table | Aggregated points table (placement pts + kill pts) across a day/stage, toggleable columns | `BRMatchEntry`, `PointsSystem`, `BRStandingsColumn` | Sortable table, columns shown per tournament's config | 🔴 |
| H2H group standings table | W-L / map-differential table per group | `GroupStandingsRow` | Simple sortable table component | 🔴 |
| Match detail page | Full result — BR: full lobby placement+kills; H2H: map-by-map score, VOD link, source link | `BRMatch`+`BRMatchEntry` OR `H2HMatch`+`MapScore` | Dynamic route `/match/[id]`, renders BR or H2H layout based on `game.format_type` | 🔴 |

### Module 1a: Dual Match System (build this first — everything above depends on it)

**Battle Royale schema:**
```
PointsSystem (id, tournament_id, placement_points_json, points_per_kill, bonus_rules_json)
  -- per-TOURNAMENT, not per-game — orgs change formats between events
  -- e.g. placement_points_json = {"1":10,"2":6,"3":5,"4":4,"5":3,"6":2,"7-8":1,"9-16":0}

BRMatch (id, tournament_id, stage_id, match_number, scheduled_at)
BRMatchEntry (id, br_match_id, team_id, placement, kills, points_earned)
  -- points_earned computed from PointsSystem at entry time, then STORED
  -- (don't recompute live — if you edit the points system later, past totals shouldn't shift)

BRStandingsColumn (tournament_id, show_matches_played, show_wwcd, show_bonus, show_placement_pts, show_kill_pts)
  -- toggleable display config per tournament
```

**Head-to-Head schema:**
```
H2HMatch (id, tournament_id, stage_id, team_a_id, team_b_id, best_of, scheduled_at)
  -- best_of lives on the MATCH, not the tournament — it changes by stage (Bo1 groups, Bo3 playoffs, Bo5 finals)
MapScore (id, h2h_match_id, map_name, score_a, score_b, winner_team_id, order)
GroupStandingsRow (tournament_id, group_name, team_id, wins, losses, map_diff, points)
```

UI components branch on `game.format_type`: BR games render the BR standings table + BR-style matchup/lobby graphic; H2H games render the bracket + Bo-count matchup graphic. No shared table trying to serve both shapes with optional fields.
| Team page | Logo, region, current roster, past results, achievements | `Team`, `Player` (via roster join), `Match` history | Dynamic route `/team/[slug]` | 🔴 |
| Player page | Bio, current team, role, past teams (roster history), tournament placements, career earnings | `Player`, `RosterHistory`, `PrizePoolEntry` | Dynamic route `/player/[slug]` | 🔴 |
| Rankings page | Points-based team/player rankings per game | `RankingSnapshot` table (game_id, team_id, points, rank, updated_at) | Admin manually updates via form, OR auto-computed from tournament placements (simple point-per-placement formula) — start manual, automate later | 🔴 |
| News feed | Short articles: roster changes, recaps, previews | `NewsPost` table (title, body, game_id, author, published_at) | Simple CMS-style form + list page, markdown body | 🔴 |
| Site search | Find team/player/tournament by name | Postgres full-text (`tsvector` column + GIN index) | One search API route, debounced input on frontend | 🟡 |
| SEO structured data | Rich Google results for tournaments/matches | N/A (derived from existing data) | Add `schema.org/SportsEvent` JSON-LD to tournament/match page `<head>` | 🟡 |

---

## Module 2: Prize Pool & Earnings Tracker

| Feature | What it does | Data needed | Build approach | Priority |
|---|---|---|---|---|
| Tournament prize breakdown | Per-placement payout table on tournament page | `PrizePoolEntry` (tournament_id, placement, team_id, amount) | Simple table component, sorted by placement | 🟡 |
| Player career earnings | Running total across all tournaments on player page | Sum of `PrizePoolEntry` where player was on the placing roster at that time | Computed query (sum), cache result, recompute on new entry | 🟡 |
| Team career earnings | Same, aggregated at team level | Sum of `PrizePoolEntry` by team_id | Same as above | 🟡 |
| Currency handling | INR by default, show USD equivalent for context | Store amount + currency code, static conversion rate updated occasionally by admin | Simple stored exchange rate row, manual update monthly (don't over-engineer a live FX API for this) | 🟢 |

---

## Module 3: Transfer & Rumor Tracker

| Feature | What it does | Data needed | Build approach | Priority |
|---|---|---|---|---|
| Transfer feed | Chronological feed: "Player X joins Team Y" | `Transfer` table (player_id, from_team_id, to_team_id, date, status: confirmed/rumor, source_link) | List page `/transfers`, filterable by game | 🟡 |
| Rumor labeling | Clearly visually distinguish unconfirmed rumors from confirmed moves | `status` enum field | Badge/color-coded UI tag ("🟡 Rumor" vs "✅ Confirmed") — this labeling is a trust/credibility feature, don't skip it | 🟡 |
| Roster history on team/player pages | Auto-populate "past rosters" from transfer records | Derived from `Transfer` table | Query all transfers involving that team/player, render as timeline | 🟡 |

---

## Module 4: Contributor & Moderation System

| Feature | What it does | Data needed | Build approach | Priority |
|---|---|---|---|---|
| Sign up / login | Account creation for contributors | User table, auth provider | NextAuth/Auth.js — email magic link or Google OAuth, don't build custom auth | 🔴 |
| Submission form | Structured forms for each entity type (new match result, new team, edit player bio, etc.) | Matches your core schema, one form per entity type | Reusable form components, each posts to an API route that creates a `Revision` row instead of writing directly | 🔴 |
| Required source link | Every submission needs a link (VOD, screenshot, sheet) | `source_link` field, required, on submission form | Frontend validation + backend rejects submissions missing it | 🔴 |
| Pending review queue | Admin/editor view of unapproved submissions | `Revision` table with `status: pending/approved/rejected` | Admin-only page listing pending revisions with approve/reject buttons | 🔴 |
| Diff view | Show what changed in an edit, side-by-side or inline | Store `before_json` and `after_json` on each `Revision` | Simple JSON diff renderer (a small diffing library, e.g. `diff` npm package, rendered as colored inline changes) | 🟡 |
| One-click rollback | Revert an entity to a prior revision | Revisions are immutable, rollback = create a new revision copying an old one's data | Button on revision history page → calls API → writes new revision with old data, re-approves | 🟡 |
| Trust tiers | New/Trusted/Editor/Admin roles with different auto-publish rights | `role` field on User, `trust_score` or edit_count | Simple role check in submission API: if role >= trusted and edit type = "update existing", auto-approve; else queue | 🟡 |
| Rate limiting on submissions | Stop spam floods from one account/IP | Redis or simple DB-based counter (per user per hour) | Middleware check before accepting a submission — at this scale a DB counter is fine, no need for Redis yet | 🟡 |
| Captcha on signup/submit | Bot protection | N/A | **Cloudflare Turnstile** (free) widget on forms | 🟡 |
| Recent Changes feed | Public feed of all approved edits | Query `Revision` where status=approved, order by date | Public page `/recent-changes` | 🟡 |
| Help Wanted page | List of pages/entities missing data, to direct contributor effort | A `flags` or `completeness_notes` field on entities, or a dedicated `HelpRequest` table | Admin flags incomplete pages; public page lists them sorted by tournament recency | 🟢 |

---

## Module 5: Graphic Maker Suite (your differentiator)

| Feature | What it does | Data needed | Build approach | Priority |
|---|---|---|---|---|
| Points Table Maker (BR variant) | Rank/team/matches played/WWCDs/placement pts/kill pts/total, columns per tournament's config | Pulls from `BRMatchEntry` sums + `BRStandingsColumn` config | Client-side canvas editor (Konva.js): template auto-filled from DB, user can recolor/reposition, export via `canvas.toBlob()` at 1080×1080 or 1080×1920 | 🔴 |
| Points Table Maker (H2H variant) | Rank/team/W-L/map diff/points | Pulls from `GroupStandingsRow` | Same engine, different template layout | 🔴 |
| Group Reveal Maker | "Group Stage Draw" graphic (Group A/B/C/D + logos) | Pulls team + group assignment from `Tournament`/`Stage` | Same Konva.js approach, different template layout | 🟡 |
| Matchup Maker (BR variant) | "Match X Lobby" graphic listing all teams in that lobby, grouped by group color | Pulls from `BRMatch` + `BRMatchEntry` | Same engine, list-style template | 🟡 |
| Matchup Maker (H2H variant) | "Team A vs Team B, BoN" hype card | Pulls from `H2HMatch` (two teams, best_of, date/time) | Same engine, template with two logos + VS + Bo-count + date | 🟡 |
| Match Result card | Final score graphic after a match | Pulls from `MatchResult` | Same engine | 🟡 |
| Player of the Match card | Highlight card for a standout player | Manual admin selection + `Player` data (photo, stats) | Same engine, admin picks player from a dropdown when creating | 🟢 |
| Fixture/Schedule poster | Full day's or week's match schedule as one graphic | Query all `Match` rows for a date range | Same engine, list-style template | 🟢 |
| Template variety | Multiple visual styles per maker type (not just one look) | Store templates as JSON layout configs, not hardcoded | Design 2-3 layout JSONs per maker upfront; Konva reads layout config + data and renders | 🟡 |
| One-click "generate from tournament" | Skip manual entry — admin picks tournament, graphic pre-fills from live DB data | Same data as above | "Generate Graphic" button on tournament admin page, opens maker pre-loaded with that tournament's current data | 🔴 |
| Export sizes | Square post (1080×1080) and Story (1080×1920) toggle | N/A | Canvas resize/reflow on toggle, same data | 🟡 |
| Small watermark/link | Subtle branding on exported graphics for organic growth | N/A | Fixed small logo + URL text baked into every template's corner | 🔴 |

---

## Module 6: Stream Channel Directory (simplified — no API, no live-status)

| Feature | What it does | Data needed | Build approach | Priority |
|---|---|---|---|---|
| Channel directory | List of team/player YouTube channel names + links | `StreamChannel` table (team_id, channel_name, channel_url) | Admin adds/maintains via a simple form — no API calls, no cron, no quota to manage at all | 🟡 |
| Display on team pages | Shows a team's YouTube channel link on their page | Same table, filtered by team_id | Simple link/button component | 🟡 |
| `/streams` directory page | Browse all tracked channels in one place | Same table | Simple grid/list page, each links out to YouTube | 🟢 |

---

## Module 7: Prediction / Fantasy Contest

| Feature | What it does | Data needed | Build approach | Priority |
|---|---|---|---|---|
| Match prediction | User picks winner before match starts | `Prediction` table (user_id, match_id, predicted_winner_id, submitted_at) | Simple form on match page, locked once match start time passes (check server-side, don't trust client clock) | 🟢 |
| Scoring | Award points for correct predictions | Compare `Prediction` vs actual `MatchResult` after admin enters result | Runs automatically as part of the same admin "save result" action — award points in the same transaction | 🟢 |
| Leaderboard | Weekly/all-time ranking of top predictors | Sum of points per user | Query + cache, `/leaderboard` page | 🟢 |
| Tournament bracket predictions (stretch) | Predict full bracket outcome, not just single matches | Extended `Prediction` schema | Build only after simple match predictions prove popular — don't front-load complexity | 🟢 (stretch) |

---

## Module 8: Contributor Gamification

| Feature | What it does | Data needed | Build approach | Priority |
|---|---|---|---|---|
| Edit count / XP | Track contribution volume | Derived from approved `Revision` count per user | Simple count query, displayed on profile | 🟡 |
| Badges | "10 edits," "First tournament added," etc. | `Badge` table + `UserBadge` join | Rule-based checks run after each approved edit (simple if-statements, no need for a rules engine at this scale) | 🟢 |
| Hall of Fame page | Public leaderboard of top contributors | Query top N users by approved edit count | `/hall-of-fame` page | 🟢 |
| Editor promotion flow | Admin promotes trusted users to Editor role | `role` field update | Simple admin action button on user management page | 🟡 |

---

## Module 9: Community Engagement Extras

| Feature | What it does | Data needed | Build approach | Priority |
|---|---|---|---|---|
| MVP fan vote | Poll after big matches: "who was MVP?" | `Poll` + `PollVote` tables | Simple poll component, one vote per user per poll (check via user_id or IP+cookie for anon) | 🟢 |
| "This Day in History" | Daily card: "On this day in 2023, Team X won..." | Query `Tournament`/`Match` where date matches today's day/month in past years | Cron job generates the day's card each morning, or compute on page load with a cached query | 🟢 |
| Live match text commentary | Manually-typed running commentary during a big match | `MatchComment` table (match_id, timestamp, text, author) | Simple chronological list, admin/trusted editor posts updates, auto-refresh via polling every 30s while match is "live" status | 🟢 |
| Follow teams/players/tournaments | Personalized "your feed" | `Follow` table (user_id, entity_type, entity_id) | Checkbox/button on entity pages, homepage query filters by followed entities when logged in | 🟢 |
| Notifications (email/push) | Alert followers when something updates | Extends `Follow` — needs a notification queue | Start with a simple daily/weekly digest email (cheap, e.g. Resend's free tier) rather than real-time push — real-time push notifications need a lot more infra for the value they add at this stage | 🟢 |

---

## Module 10: Admin/CMS

| Feature | What it does | Build approach | Priority |
|---|---|---|---|
| Admin dashboard | Central place for you to manage everything | Auth-gated `/admin` route tree, role-checked | 🔴 |
| CSV paste for standings | Fast bulk entry after a match | Textarea → parse (papaparse) → preview table → confirm → save | 🔴 |
| "Save + Generate Graphic" combo action | One click: update DB + open Graphic Maker pre-filled | Chain the two actions in one button handler | 🔴 |
| User/role management | Promote/demote/ban contributors | Simple table with action buttons | 🟡 |

---

## Module 11: Infra (recap, unchanged from earlier in this conversation)

| Piece | Choice |
|---|---|
| Hosting | Cloudflare Pages/Workers (free, ad-safe) |
| DB | Neon/Supabase free Postgres, via Prisma/Drizzle |
| Domain | `esportshub.site` via Cloudflare DNS |
| Content updates | Admin write → `revalidatePath()` → instant, no CI/CD |
| Code deploys | GitHub → Cloudflare Pages auto-deploy on push |
| Backups | Nightly `pg_dump` → Backblaze B2/R2 free tier |
| Monitoring | UptimeRobot free |
| Media storage | Cloudflare R2 free tier |

---

## Build order, restated as a checklist

**🔴 MVP — get this live first:**
Game hubs → Tournament/Match/Team/Player pages → Group tables → Auth + submission forms + pending queue → Points Table Maker → Admin dashboard + CSV paste

**🟡 Phase 2 — once MVP is live and has some content:**
Bracket component → Prize pool tracker → Transfer/rumor tracker → Diff view + rollback → Trust tiers + rate limiting + Turnstile → Recent Changes → Group Reveal/Matchup/Result makers → Who's Live Now → SEO structured data → Search

**🟢 Phase 3 — once you have regular traffic and contributors:**
Predictions/fantasy → Gamification/Hall of Fame → MVP polls → This Day in History → Live match commentary → Follow + digest emails → Help Wanted page

---

## Note on using Claude Pro for the actual build

Once you're building this for real, **Claude Code** (included with Pro) is worth using directly in your project folder rather than just chat — it can read your actual schema/files, run migrations, and implement one row of this table at a time as a concrete task ("implement the Points Table Maker per the spec in this doc"). Keep this document in your repo as the source of truth to point it at.
