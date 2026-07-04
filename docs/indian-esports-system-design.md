# Indian Esports Hub — System Design (Solo Dev, Near-Zero Budget, 200k users/month)

## 0. The core reframe

This is **not** an integration-heavy real-time data platform. It's a **crowd-sourced wiki/CMS**, same as Liquipedia and same as EsportsVerse — because none of your target games expose the data you actually need (Indian community & regional tournament results):

| Game | Official API? | Covers Indian community tournaments? | What it's actually useful for |
|---|---|---|---|
| BGMI / PUBG Mobile | Krafton API exists but is for PC PUBG player stats, not BGMI esports | No | Nothing usable for your case |
| Free Fire | None | No | N/A — 100% manual |
| Valorant | Riot API is opt-in-only, no aggregate scouting; unofficial vlr.gg scrapers exist (ToS risk, only global VCT) | No (India events aren't on vlr.gg reliably) | Maybe global VCT news enrichment only |
| Dota 2 | **Official free Steam Web API**, plus OpenDota (free, open, very good) | Only for pro/global matches, not Indian LAN/online cups | Good bonus content for global Dota section |
| LoL / Wild Rift | Riot has an official free dev API (rate-limited, key rotates daily unless you get a production key) | No, and Wild Rift has ~no API | Bonus global content only |
| Mobile Legends (MLBB) | None | No | 100% manual |

**Conclusion:** ~90%+ of the value you're offering (Indian tournament brackets, scores, standings, player/team pages) has to come from **humans typing structured data in**, verified against a source (VOD, official Discord/sheet, broadcast screenshot). APIs are a nice-to-have enrichment layer for global esports news, not your backbone. Design the whole system around **content + moderation workflow**, not data pipelines.

This also means your traffic pattern is "content site with SEO long-tail," not "real-time dashboard" — which is good, because content sites are *very* cheap to make resilient.

---

## 1. Reality check on scale

200,000 users/month ≈ 6,500/day average, bursting maybe 15–25k on a big BGMI/Valorant India final day, spread over a few hours. Peak concurrency is low hundreds, maybe low thousands for a few minutes. This is comfortably served by:

- **One app server** (even a $6/mo VPS) 
- **One Postgres database** on the same box
- **Cloudflare in front, free tier**, doing the heavy lifting on caching/DDoS/edge delivery

You do **not** need Kubernetes, microservices, message queues, or multi-region failover at this scale. Adding them now would cost you (solo dev) more time in ops than it saves you in uptime. Design for boring reliability first; design for horizontal scale only when you have evidence you need it (a specific roadmap for that is in §7).

---

## 2. Data model (the wiki's spine)

Core entities, all versioned (every edit creates a revision row — this is non-negotiable for a crowd-sourced site):

```
Game (bgmi, freefire, valorant, dota2, mlbb, wildrift, lol)
Tournament (name, game_id, tier, region, start/end, prize_pool, organizer, source_links[])
Stage (group stage / playoffs, belongs to Tournament)
Match (stage_id, team_a, team_b, scheduled_at, status, source_links[])
MatchResult (match_id, score_a, score_b, per-map/per-game breakdown, submitted_by, verified_by, source_links[])
Team (name, game_id, logo, roster_history[], region, socials)
Player (name, real_name?, team_id, role, country, socials)
StandingsSnapshot (tournament_id, stage_id, computed or manually entered table)
Revision (entity_type, entity_id, diff_json, editor_id, timestamp, status: pending/approved/rejected/auto-approved)
Contributor (user_id, trust_tier, edit_count, warnings, banned_until)
```

Every `MatchResult` and `Tournament` submission **requires at least one `source_link`** (YouTube VOD timestamp, Discord announcement screenshot URL, organizer's public sheet, official social post). This is your single biggest defense against misinformation and it costs nothing to enforce — just a required field + moderator checklist.

---

## 3. Contributor & moderation workflow (this is the actual hard part)

Trust tiers, Wikipedia-style:

1. **Anonymous/new account** → all submissions go to a **pending review queue**, nothing goes live until approved.
2. **Trusted contributor** (e.g. 10+ approved edits, no rejections in 30 days) → edits to *existing* entities auto-publish but are flagged for spot-check; *new* tournament/team creation still queued.
3. **Editor** (manually promoted by you) → full auto-publish rights, can approve/reject others' queue, can roll back vandalism.
4. **Admin (you)** → everything, plus can ban/demote.

Mechanics that matter more than the tier system itself:
- **Diff view** on every edit (like Wikipedia) — makes moderation fast, you're scanning a diff not re-reading a whole page.
- **One-click rollback** to any prior revision.
- **Per-IP and per-account rate limiting** on submissions (e.g. max 10 pending submissions/hour for untrusted accounts) — stops spam floods without needing anything fancy.
- **Cloudflare Turnstile** (free, privacy-friendly captcha) on signup and on submission forms to cut bot spam before it hits your queue at all.
- A public **"Recent Changes"** feed (again, Wikipedia-style) — free crowd-moderation, since your most engaged users will self-police obviously fake entries.

This workflow is what actually protects your credibility (which is your whole product). Get this right before worrying about infra scale.

---

## 4. Tech stack (optimized for: solo dev, near-zero budget, low ops burden)

**Principle: one deployable, boring, well-documented technologies, nothing you'll be debugging at 2am because it's exotic.**

- **Framework**: Next.js (App Router), single monolith — pages, API routes, and admin/moderation panel all in one codebase. This gives you SSR for SEO on public pages and a built-in backend for submission/moderation APIs, no separate services to deploy or keep in sync.
- **Database**: PostgreSQL. Self-host it **on the same VPS** as the app to start — zero recurring cost, and at this scale (a few GB of data, low write volume) it's genuinely fine. Use an ORM (Prisma or Drizzle) so migrating to a managed Postgres later (Neon/Supabase free tier, or a bigger box) is a config change, not a rewrite.
- **Caching / rendering strategy**: Use **Incremental Static Regeneration (ISR)** for tournament/team/player/match pages — regenerate every N minutes or on-demand when an edit is approved. This means almost all real traffic hits pre-rendered HTML from Cloudflare's edge cache, **not your database**, which is what actually makes you resilient on a $6 VPS.
- **CDN / edge**: Cloudflare free tier in front of everything — caching, DDoS mitigation, Turnstile captcha, and (bonus) it'll keep serving cached pages even if your origin VPS briefly goes down or reboots.
- **Media storage**: Cloudflare R2 (free egress, 10GB free storage) for team logos, tournament banners, screenshots-as-sources.
- **Search**: Postgres full-text search (`tsvector`) is genuinely sufficient at this scale — don't add Elasticsearch/Algolia yet.
- **Auth**: simple email/OAuth via NextAuth/Auth.js — don't build your own.
- **Monitoring**: UptimeRobot free tier (5-min ping checks + email/SMS alert), plus Cloudflare's own analytics dashboard. That's enough alerting for this scale.
- **Backups**: nightly `pg_dump` cron job pushed to Cloudflare R2 or Backblaze B2 (both have generous free tiers). **Test the restore once a month** — an untested backup is not a backup.
- **Process management on the VPS**: PM2 or a systemd service with `Restart=always` — if the Node process crashes, it restarts itself in seconds. This alone prevents most "site is down" incidents on a single box.

**Hosting recommendation**: a $5–6/mo VPS (Hetzner, DigitalOcean, or similar) rather than a serverless free tier (Vercel Hobby, etc.), because serverless free tiers have hard bandwidth/function-time caps and Terms-of-Service restrictions on commercial use that a growing site with ads will bump into. A VPS + Cloudflare in front gives you predictable cost and no surprise throttling, for less than the price of a coffee a month.

---

## 5. "Never goes down" — what that actually means at this budget

You can't buy 100% uptime for free, but you can get very close with layered, cheap defenses:

1. **Cloudflare edge caching** absorbs traffic spikes and serves stale-but-correct pages even during a brief origin outage (`stale-while-revalidate`).
2. **ISR/static pages** mean 90%+ of requests never touch your database or even your app server logic — they're just cached HTML.
3. **Process auto-restart** (PM2/systemd) recovers from crashes in seconds without you touching anything.
4. **Automated off-site backups** mean "the VPS died" is a recovery-in-an-hour problem, not a lost-everything problem.
5. **Rate limiting on write endpoints** (submissions, comments) stops the one realistic attack vector for a small site: someone spamming your forms, not DDoSing your infra.
6. **Uptime alerting** (UptimeRobot) means you find out about problems in minutes, not from angry tweets.

This gets you to "reliable enough for a 200k MAU content site" without needing a team or a cloud bill. True zero-downtime, multi-region, auto-failover infrastructure is a real thing companies build — but it's solving for scale and SLAs you don't have yet, and building it now would just be your one pair of hands maintaining complexity for no benefit.

---

## 6. SEO / growth (this is genuinely more important than infra for hitting 200k)

Liquipedia's traffic comes from **programmatic long-tail pages**: every player, every team, every match, every tournament has its own indexable URL. Your growth plan:

- One page per Team, Player, Tournament, Match — auto-generated from your data model, not hand-written.
- `schema.org/SportsEvent` structured data on tournament/match pages for rich Google results.
- Fast Core Web Vitals (which ISR + edge caching gives you basically for free).
- A "Recent Changes"/news feed page that's frequently updated — Google rewards freshness for this content type.
- Encourage contributors to add source links — this incidentally builds backlinks to VODs/Discords/organizer pages, which is good community karma and gets you noticed by those organizers.

---

## 7. Phased roadmap

**Phase 1 (MVP, 4-8 weeks solo):**
- Pick ONE game with the biggest Indian scene to launch with (BGMI is the obvious choice — largest Indian esports audience).
- Core data model, contributor submission form, moderation queue, revision history.
- Team/player/tournament/match pages with ISR.
- Cloudflare + VPS + backups + monitoring set up from day one (this is cheap to do early, expensive to bolt on later).

**Phase 2 (expand games):**
- Add Free Fire, Valorant, then the MOBAs (MLBB, Wild Rift, Dota 2, LoL) one at a time.
- For Dota 2 and LoL, integrate OpenDota / Riot's free API as a **bonus global-esports content layer** (news, global pro standings) — clearly separate from your India-focused manually-verified content, so you're transparent about what's crowd-verified vs. auto-pulled.

**Phase 3 (community & monetization):**
- Public contributor leaderboards/badges (cheap gamification that drives retention of your unpaid editor workforce — this is literally how Wikipedia and Liquipedia sustain themselves).
- Ads (no API costs to worry about at this stage).
- Only *now* consider: read replicas, separate DB server, a second app server behind a load balancer — and only if monitoring data shows you actually need it.

---

## 8. Estimated cost to start

| Item | Cost |
|---|---|
| VPS (Hetzner CX22 or similar) | ~₹450–550/mo |
| Domain | ~₹800–1000/yr |
| Cloudflare (free tier) | ₹0 |
| Cloudflare R2 (free tier, until you outgrow 10GB) | ₹0 |
| Backups (Backblaze B2 free tier) | ₹0 |
| UptimeRobot | ₹0 |
| **Total** | **~₹500/mo** |

That's the whole infra bill until you're well past 200k MAU.
