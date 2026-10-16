# Ledger choice order and company labels

2026-10-16 — Filmanthropy Ledger / Codex

Base: main `4ff71ae55f6b5da43de5a8542caf712cb379ea39` (published PR #11).

Bret requested the phone reading order **01 Case Studies, 02 Essay, 03
Filmanthropy and AI**. The source card order now follows that sequence on both
mobile and desktop, followed by the existing Stories from the Field, Happening
Now and Submit Your Story cards. The first three desktop/mobile menu items and
the corresponding view labels match. Existing section hashes, featured Eva and
Vinati links, and article/entry content are preserved.

The current Ledger's company menu links, header/mobile identity, opening
byline, company-information link, AI note label and learn-about action now use
**Social Effects NJ**. The established footer tagline “From Special Effects to
Social Effects” and canonical article prose are preserved. This change does not
rewrite the older company site; Bret's branding direction also applies to its
future rewrite. Opening paragraph revisions remain pending Bret's copy review.

Changed files: `Filmanthropy_Ledger_v2.html`, `tests/ledger-round-2.cjs`, and this
handoff. No CSS, JavaScript, route, image, metadata, news data or company-page
change is required. Shared planning notes are recorded in the governed task
ledger, rather than copying private business source material into this repo.

Validation: existing focused regression with normal scrolling motion at
1440×1000 and 390×844 passed. Checks include exact card/menu order and numbers,
company labels, stacked phone cards, desktop alignment, Eva/Vinati navigation,
Case Studies/Forerunners landing, AI and menu-note navigation, mobile keyboard
focus/closing, submission email destination, feed-only Happening Now, lazy
16:9 playlist embeds and NJ feed-priority fixtures. Legacy/alias/16 entry URLs
return HTTP 200; unchanged canonical prose and entry data are compared to their
existing baselines. No site JavaScript errors. Mobile card screenshot visually
reviewed. External fonts/icons/players are substituted in browser checks; actual
third-party delivery and physical-phone behavior are not claimed. Whitespace
checks pass. The existing test now waits for normal scrolling to finish before
checking note-page header clearance.

Use a normal PR for review. Publication is not included until Bret authorizes
merging this change. The PR supplies the pinned review preview and current
implementation commit; main remains the production source.
