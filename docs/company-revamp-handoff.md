# Social Effects NJ company site reading draft

Requested working location: https://socialeffectsnj.com/new/

This is the separate-page reading draft requested by Bret, based on his edited [website copy master](https://docs.google.com/document/d/1r2eaaiBrEJKx7nRx1rCyQxCjSt3ca8PA_tFbhJQYjVk/edit). The source was rechecked at its 16 October 2026, 07:49:59 UTC revision; the Google Doc was not overwritten. The existing company homepage and the separate Filmanthropy Ledger publication are not changed by this branch.

## Page map

| Page | Contents |
| --- | --- |
| `/new/` | Whole-enterprise identity, Document/Present/Teach/Do, Ledger/work invitations, examples, New Jersey collaboration and foundation/LLC summary |
| `/new/our-practice.html` | What We Do: enterprise cycle and engagement routes, followed by the deeper Filmanthropy practice and optional reading |
| `/new/offerings.html` | Presentations & Labs: audience, presentation/conversation/lab, intended takeaways, booking and three protected decks |
| `/new/production-services.html` | Discovery, Design, Liaison, Story; Film Ready towns and fees; route to proposed Production Reuse operation |
| `/new/film-biz-recycling.html` | The proposed reuse operation, material/human/proceeds streams and future pipeline |
| `/new/values.html` | Edited principles, vision, mission and Moonshot invitation |
| `/new/team.html` | About: Bret and Andrew, “More to come soon,” proposed Foundation/LLC structure and wider operating scope |
| `/new/contact.html` | Existing public email, phone, WhatsApp and Telegram routes |
| `/new/filmanthropy-history.html` | Companion history copy from the master |
| `/new/why-filmmaking-is-civic.html` | Companion AI/civic filmmaking copy from the master |
| `/new/moonshot.html` | Companion Moonshot copy from the master |

Navigation, responsive menu, footer, assets and styles live within `/new`. Existing projector/theater/Fort Lee imagery and portraits are copied byte for byte. The established cream, dark, gold and rust palette and type families are retained. All eleven draft pages carry `noindex,follow`; that is an indexing preference, not access control.

## Deck viewer

Bret selected password-protected exported copies rather than a prompt over public Google embeds. The rest of the page stays public. One viewer switches among:

1. Filmanthropy by Design Presentation and Lab (15 slides)
2. Purpose by Design Lab: Corporate (12 slides)
3. Regenerative Filmmaking: Educational Pathways (16 slides)

The native file titles were updated, along with the first and third cover titles. Native slide order, non-cover slides, notes and existing styling are preserved. Updated titles and new website copy use no em dashes.

Only cover thumbnails and the three titles/captions are public. The slide images and accessible slide text are encrypted. `new/private-decks.js` derives a non-extractable AES-256-GCM key in the visitor’s browser using PBKDF2-SHA256 (600,000 iterations and a random salt). Every encrypted file has a separate random 96-bit IV, authentication tag and path-bound additional data. Neither the password, key, plaintext exports nor source Google deck URLs are in the public viewer files. The password is not transmitted, stored in browser storage or saved in a cookie. Lock/reload clears the viewer; the rest of the page is unaffected. Original Google embeds returned HTTP 401 anonymously for all three decks after access was restored to restricted.

The current password is delivered privately to Bret, outside this repository and PR. People with the password can view and copy displayed content; this does not provide individual-account revocation. Existing named Google collaborators retain their permissions. No messages or permission notifications were sent to collaborators.

These are exported snapshots, not live Google embeds. Refresh exports after editing a source deck. The viewer provides previous/next controls, arrow keys, full screen where supported, slide text and a lock control. Native animations and clickable slide objects are not preserved in the image viewer.

`scripts/package-private-decks.cjs` packages approved local exports. Its two arguments are a private input JSON file and a private password file, both outside this public repository. It writes only encrypted packets, covers and public configuration under `new/decks`. Keep source PDFs, images, native JSON and password files outside the repository. A future password rotation requires repackaging all decks; previously downloaded copies cannot be recalled.

The packager defaults to a 20-character minimum. Bret requested a shorter, memorable shared password on 16 October 2026; `--allow-short-password` explicitly permits that choice. A short, predictable password provides light protection and is vulnerable to guessing. The password value stays outside this repository. Each repackaging uses new packet filenames so a refreshed viewer cannot mix old cached ciphertext with a new key. The viewer requests configuration and packets without browser caching. Reload an already-open viewer after a password change.

## Editorial boundaries

The Doc remains the creative master. Subsequent homepage wording follows Bret’s direct approval: explain the idea briefly, include generosity and community social impact, then invite booking. The original long Foundation/LLC opening is no longer the homepage introduction; detailed entity information now follows the people on About. The Doc itself has not been overwritten. Company legal structures, recycling operations, academic credentials and unconfirmed affiliations remain proposed/intended where the source identifies them that way. The public team is only Bret and Andrew. Informal editorial instructions and unconfirmed private partnership speculation were not turned into public commitments. The practice page includes a concise regenerative synthesis with a link to the canonical Ledger. Statistics and historical assertions carried over from the source are editorial material, not newly certified facts. No final homepage migration or new legal structure is established by this draft.

## Return navigation and booking refinement

Every `/new` page retains its end-of-page return link. At Bret’s request, the repeated upper return panels have been removed; the homepage’s bottom Back to Home link remains. End links identify the same-site page the visitor came from and use native browser Back, restoring the saved reading position. A direct landing has an explicit parent-page fallback that works without JavaScript. Page positions and the prior-page label stay in browser history state; no company records or credentials are duplicated in storage. Menus close before leaving so they do not cover the page when a reader returns. Back/Forward and reload preserve reading positions, including nested page visits. Original Ledger routing is unchanged.

The homepage gives the short invitation Bret approved and leads to the contact/booking page. The contact page links to Bret’s supplied **20-minute exploratory-call** Calendly event, alongside existing public contact methods. This new event supersedes the earlier temporary choice of the existing 30-minute meeting. No appointments were booked or scheduling settings changed by Codex. The recycling concept appears as **Production Reuse** in navigation; its page names the **proposed Film Biz Recycling Franchise**. The introduction and three-stream transition are shorter and no longer refer to content “above” that belongs on a different page. This is a proposed operation, not a representation that a franchise agreement has been completed.

## Validation

- All ten pages: HTTP 200, expected navigation destinations, one main heading, one noindex tag, menu/Escape/focus behavior and no horizontal overflow at 1366, 1024, 390 and 320 pixels. Revised source-copy anchors, four services, four SVG methodology icons and byte-identical original images pass. No site JavaScript errors or failed `/new` assets.
- Protected viewer: wrong passwords rejected; all 43 slides loaded and switched at 1366, 390 and 320 pixels; previous/next, arrow keys, boundary states, accessible slide text, re-locking, locked reload and empty browser storage pass. No password in outgoing requests. Modified ciphertext rejected. No plaintext deck exports, Google source URLs or password found in `/new`.
- All slides rendered from Google PDF exports and visually inspected; cover typography preserved. Structural checker reports no errors. Existing small-type warnings in unchanged source slides were preserved for a future deck-editing pass.
- Tests: `tests/company-revamp.cjs`, `tests/private-decks.cjs`. The latter requires `DECK_TEST_PASSWORD_FILE` pointing to the private password file. `COMPANY_ORIGIN` can select a deployed origin. Do not commit test credentials.
- Follow-up return tests: `tests/company-return.cjs` checks two-level contextual returns, browser Back/Forward, exact reading positions, reload, mobile menu closure, direct-link fallback without JavaScript and the homepage-to-booking route at 1366/390/320 pixels. The return strip sits outside `main` so it remains available while the footer is in view. All ten pages also pass the layout/menu suite after the shared header/return changes.

Publication and exact live acceptance are recorded in the PR after deployment. Remaining work is Bret’s reading/design pass, future copy/services refinement, future team decisions, and refreshing exported decks as their sources evolve.

## New Jersey collaboration copy refinement, 16 October 2026

Bret directed a refinement of the site’s position within New Jersey’s film community. The revision celebrates New Jersey film growth and existing production, crew, municipal, educational and nonprofit work. It removes claims that most of the industry stops at a floor, that earlier giving could not last, or that few towns have considered community benefit. Sustainability, contribution and regenerative outcomes remain distinct, connected practices. Early planning, a responsible person, production feasibility and community priorities clarify the service offered. The presentation/lab description gives a concrete learning outcome.

The [official NJ Take 2 page](https://www.nj.gov/njfilm/nj-take-2.shtml) supports the linked program description. Unverified operational claims about universal intake lists, and promises to become the statewide coordinating layer, were replaced with the proposed operation’s specific intended contribution. This is independent work; no government affiliation or endorsement is implied. Canonical Ledger essay/entries, original homepage, deck files, booking event and navigation behavior are unchanged. Native Google Docs/Slides were not edited.

## Clearer visitor paths and hero proportions, 16 October 2026

Following Bret’s instruction to restructure, the homepage now moves from a short orientation to the Presentation and Lab invitation, real examples, practical services, New Jersey collaboration and booking. Detailed definition/history/three connected approaches move to Our Practice. The primary menu is Presentations & Labs, Production Services, Our Practice, About and The Ledger, with Book a Call alongside. Production Reuse, Values & Vision and companion essays remain available in the full menu and footer. Existing page addresses remain usable.

Presentations & Labs retains /new/offerings.html and #presentations, the original encrypted deck assets, password flow and three-deck switcher. It now explains the audience, activities and practical takeaways before the slides. Production Services is a new page with the existing four-service detail, four methodology icons, town offering and reuse invitation. The old #services anchor on Offerings remains as a route to that page. About retains /new/team.html, both existing biographies and the unconfirmed-team boundary, with the proposed legal/operating information moved below the people. Original company homepage and Ledger content remain unchanged.

Page-hero images were already full width but some short headings made the banners shallow, especially Who We Are on phones. Shared minimum heights now give desktop banners 520px and smaller-screen banners at least 400px, while longer content can grow. Background cover sizing retains the image aspect ratio and existing imagery; no image was regenerated or distorted. Hero jump links use the established gold on dark backgrounds. Shared CSS/JS references are versioned.

A one-minute Grok video script and six-shot production brief are delivered separately to Bret. Recommended placement is click-to-play after the homepage opening, before the main presentation invitation, with a poster, captions and a booking route. No video has been generated, no public player or placeholder has been added, and no paid generation has been started.

## Restore the whole-enterprise identity, 16 October 2026

Bret approved a revision after reviewing the booking-focused draft. The homepage now introduces Social Effects NJ as a developing foundation and LLC connecting education, awareness, entertainment and practical services. The existing headline remains From Special Effects to Social Effects, followed by Document. Present. Teach. Do. Four connected activities describe the whole undertaking; Discovery, Design, Liaison and Story remain the distinct production-service method. The existing four activity icons moved from the services page to the enterprise cycle, without regenerating imagery.

The two main homepage invitations are Explore our work and Read the Ledger. The Ledger is described as a publication by Social Effects NJ, with its distinct identity and existing address retained. The foundation/LLC summary is visible on the homepage; formation details remain qualified as proposed/developing in About. No legal status is inferred.

Primary navigation is What We Do, The Ledger, Work With Us and About, plus Book a Call. Programs and deeper articles remain accessible under an optional Explore further disclosure in the full menu and footer. The What We Do page reuses our-practice.html, introducing the four-activity cycle before the fuller practice material. Work With Us reuses the contact page and existing 20-minute booking event. No pages were added or deleted. No new domain, DNS, root-homepage replacement, Ledger editing, native-deck change or video integration is part of this revision. /new remains the published working draft.

Validation for this revision: eleven routes at 1366/1024/390/320px, enterprise wording and four activities, simpler primary menu and program disclosure, existing headings/assets/noindex and layout bounds; two-level contextual returns, updated What We Do labels, program-menu navigation, reading-position restoration and the What We Do-to-booking path at 1366/390/320px. Hero previews with actual fonts were inspected on desktop and phone. The encrypted viewer and deck assets were unchanged; final live viewer acceptance is recorded in the PR.

Direct-entry return links also match the simplified hierarchy: history/AI and Work With Us return to What We Do, while the reuse concept returns to Production Services. These HTML fallbacks work without JavaScript; contextual Back links still return to the actual prior page when one is known.

## Homepage review batch, 16 October 2026

Bret authorized applying, pushing and merging both saved homepage tweak batches. The menu and footer now use **The Filmanthropy Ledger**, and the hero invitation says **Read the Filmanthropy Ledger**. The homepage hero has less vertical padding; short laptop screens receive a modest heading-size adjustment so both buttons fit, while phone content can grow naturally.

The introductory definition uses Bret’s exact wording: “Our definition of Filmanthropy is the love of film and the love of man weaving together through the films we make and the ways we make them.” A short word-history card with an inline filmstrip graphic sits above Do on wide screens and stacks on smaller screens. The date is grounded in [Ted Leonsis’s November 2007 article for the International Documentary Association](https://www.documentary.org/feature/enter-filmanthropist-new-metrics-documentary-success), rather than repeating the tentative 2008 date from the saved note. The card links to the existing history page; the longer source article is unchanged.

The examples CTA is centered beneath all three cards and reads **Explore the first 16 case studies**, opening `/filmanthropyledger/#case-studies`. The broader Ledger introduction remains in Find Your Way In. Start with a Conversation retains booking as the main invitation, adds Email Bret beside it and offers smaller WhatsApp, Telegram and Text / SMS choices beneath. Bret explicitly supplied the public contact number. Telegram uses the [documented international phone-number link](https://core.telegram.org/api/links#phone-number-links); account discovery still depends on Telegram’s app/privacy behavior. No messages, emails or appointments were sent or booked during testing.

The original company homepage, canonical Ledger content, slide assets/password and existing artwork remain unchanged. The black, warm ivory, gold and rust palette is retained. Upper return strips are removed from all eleven draft pages; bottom links and history-position restoration remain. Shared CSS/JS references advance to version 6.

Validation includes all eleven draft routes at 1366/1024/390/320px, menu/focus and overflow checks, the centered CTA opening all 16 entries, wide-screen history-card alignment above Do, exact contact destinations, retained bottom-link/native Back/Forward/reload restoration, and actual-font hero previews at 1366×768, 1366×640 and 1280×720 plus phone previews. The entry-navigation test isolates unchanged external YouTube players; it does not certify external video playback. Actual messaging-app handoff and delivery require a device/account and are not claimed by link inspection. Publication receipts and exact live acceptance are recorded in the PR and shared TODO.
