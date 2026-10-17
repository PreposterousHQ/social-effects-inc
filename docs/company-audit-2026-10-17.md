# Company site audit, 17 October 2026

Scope: all eleven live `/new/` pages, the main navigation/footer, linked destinations, company-to-Ledger journeys and the live Calendly booking flow. Baseline: published PR #42, merge `e14009bfbe89d2d10eaf808c7c2d493cc9f43642`. This is one bounded review, not a redesign or an ongoing copy-shortening loop. Edits are a preview on `codex/company-final-audit`, awaiting Bret’s next “k”.

## Assessment

Keep the current page structure and primary menu. The company homepage introduces the practice, What We Do explains it, the Ledger holds the publication, About explains the people/organization, and Work With Us handles contact/booking. Supporting pages have a clear job and remain available through the secondary menu.

Repeated links in the header/footer and a relevant next step after a long page serve different reading positions. Removing them all would make readers scroll back or hunt. The useful changes are selective: remove the repeated lab-booking link immediately before the combined booking action, and remove an unrelated About-structure detour from the reuse overview. The homepage activity link now says exactly where it leads.

## Preview improvements

| Area | Finding and change |
| --- | --- |
| Homepage | “Choose a way to work with us” led to the four activities rather than contact. Changed to “Explore the four activities.” Removed one sentence repeating the New Jersey paragraph. |
| Presentations | The audience, century of history and tailored format were repeated in the opening and first card. Shortened those passages and kept one combined booking action after the two session types. Proposal wording, protected decks, brand Presentation and Lab title and existing-film invitation remain. |
| Reuse proposal | The opening said proposed, while later text promised trucking, exhaustive tracking and ready-to-use tax/ESG reporting. The process now describes the proposed operation, realistic records and partner arrangements. Materials are distinguished from time/skills and financial giving available through the broader production services. This does not change an operating agreement or establish a franchise. |
| Reuse context | Reduced eight assertions to four dated, sourced figures. Corrected $833M from “qualified spend” to total in-state production spending. Removed the unsupported workforce ranking, stale Film Ready count and absolute studio/opening claims from this bar. The one dated source link is readable in the existing palette. |
| Values | Mission now describes a foundation and LLC in development, matching About. Shortened the technology explanation, used Social Effects NJ, removed an unlinked editorial “See Skater Girl” aside and an unsupported “first fully” superlative. The longer Vision passage is preserved apart from the company name. |
| Contact | Removed the duplicate company-name eyebrow and aligned browser/share title with Work With Us. Normalized the telephone link to +1 for international visitors; the visible number and all other calendar/contact destinations are unchanged. |
| Repository README | Corrected obsolete private/stealth/undeployed status, route map and word-origin claim. Described protected proposal decks separately from approved public Moonshot snapshots. Current routing and later launch plans are clearly distinguished. |

Main-text counts include visible headings and link labels, measured in the browser:

| Page | Before | Preview |
| --- | ---: | ---: |
| Homepage | 468 | 449 |
| Presentations & Labs | 392 | 343 |
| Production Reuse | 741 | 592 |
| Values & Vision | 875 | 716 |
| Contact | 76 | 73 |
| All eleven company pages | 8,609 | 8,230 |

Other six page texts remain unchanged. The canonical Ledger essay/cases/data, company AI essay, Moonshot essay, protected/public deck contents and About/bio are untouched.

## Links and user journeys

- Inventoried 54 unique original link targets including hashes, mail, telephone and SMS. All 30 distinct original HTTP destinations returned 200 after redirects, including the external word-history sources, NJ Take 2, Telegram, WhatsApp and Calendly. A 200 response is not a claim of video playback or message delivery. The new NJEDA source also returns 200.
- Clicked every internal body link in the revised company pages: 39 actual source-to-destination journeys, each followed by native Back. This includes Eva and Vinati redirects, case studies, essay anchors, story contribution, offers and contact. No wrong landing or site JavaScript error was found.
- Confirmed all company anchors exist. Ledger hashes such as `#case-studies` and `#submit-your-story` are router states rather than literal element IDs; the correct visible views were tested instead of misreporting missing IDs as broken links.
- Eleven-page regression passed at 1366/1024/390/320px: one h1, noindex, menus/focus, destinations, responsive bounds and assets. Native Back/Forward, exact reading positions/reload and booking passed at 1366/390/320px.
- Shared company/Ledger contribution copy, stories/news/submission routes and native Back passed with actual fonts at 1920/1366/1024/1000/768/390/320px. The interim email contribution path is still present, as expected until the separately requested form is ready.
- Live Ledger regression passed at 1440/390px: all sixteen entry URLs/hashes, `/ledger`, `/eva`, `/vinati`, `Filmanthropy_Ledger.html`, `#fbr`, `#skater-girl`, Case Studies/Forerunners, keyboard entry/return and section routing. Canonical prose/data and the exact framework phrase remain protected. Lazy responsive playlist structure and NJ-first news ordering pass; external players/font CDNs are substituted in this routing suite, so it does not assert playback.
- Actual-font edited-page layout checks passed at 1366/390/320px. Desktop/phone captures of reuse, the four sourced statistics, Presentations and Values were inspected. `git diff --check` passes.

## Calendly, tested through the booking form

The live Work With Us “Choose a time” button opens Bret’s `20-minute-exploratory-call` event. At 1366px and 390px, available dates and time slots loaded; selecting an available date and 6:30pm Eastern on 17 October 2026 reached the name/email booking form and visible Schedule Event action. No name/email was entered and Schedule Event was not clicked. No appointment or invitation was created. Email reminders, calendar writes and conferencing details after confirmation are therefore not claimed as tested. Slot availability is momentary.

The first probe inspected the calendar before asynchronous availability had arrived; waiting for enabled date controls resolved that, not an account setting change. A later probe used the visible “Next” text while Calendly’s accessible name also includes the chosen time. Correcting the selector completed the journey without any website or Calendly configuration change.

## Deliberately remaining

1. Bret will supply new bio material. Keep the About summary near its current length and add a separate, longer biography in the established editorial style, with Social Effects NJ named consistently. No longer-bio draft or route is represented as ready yet.
2. Decide the public workshop/lab wording once; the current choice remains pending. Do not silently rename the branded Presentation and Lab deck.
3. Replace interim email story intake with a working reviewed text/audio/video submission form before the main-site launch. No provider, backend or form configuration was added by this audit.
4. The Ledger’s company links still lead to the existing company site. Update them with the planned root-homepage transition, alongside `/ledger`, rather than making the public publication depend on this draft unexpectedly.
5. During the planned AI copy upgrade, review its statement about daily use for matching/logistics against the actual operational stage. The essay is deliberately unchanged here.
6. The Moonshot is framed as a thought experiment. Its stronger health-care, reimbursement, permanent-ownership, financing and construction-timeline assertions still need a dedicated factual review before the full launch. This audit has not certified them or silently rewritten Bret’s essay.
7. Google source edits require re-export of deck snapshots. The original Storylivingry NJ1/NJ2 wrapper sign-in issue remains separate; the new public Moonshot snapshots work independently.

These remaining items are named work, not reasons to keep restructuring the site. No root/DNS migration, publishing, source-deck sharing change, new service purchase or external message occurs in this preview.

## Sources and preview

Industry figures: [NJEDA, 2024 Film Industry Spending Breaks Yet Another Record in NJ, 21 October 2025](https://www.njeda.gov/2024-film-industry-spending-breaks-yet-another-record-in-nj/). The dated figures and program context use this one source; other differing annual-report estimates were not combined with it.

Local preview, laptop server required: http://127.0.0.1:61262/new/ ; http://127.0.0.1:61262/new/offerings.html#presentation-overview ; http://127.0.0.1:61262/new/film-biz-recycling.html#practice ; http://127.0.0.1:61262/new/values.html . Current publication status and exact review head belong in the PR and shared TODO.
