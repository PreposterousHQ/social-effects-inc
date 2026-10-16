# Social Effects NJ structure and repetition audit

16 October 2026. Scope: eleven `/new/` pages, navigation and next steps, plus the Ledger sentence beneath the playlists and reported scroll jumpiness. This is a structure/copy audit, not a new fact-check of the companion essays. Original company homepage, creative masters, protected decks and canonical Ledger essay/entry wording remain intact.

## Page responsibilities

| Page | Purpose and result |
| --- | --- |
| Homepage | Introduce the enterprise, definition and four activities; show examples; offer a compact way to act after reading. Full contact details belong on Work With Us. |
| What We Do | Explain the activities and practical approach. Removed repeated definition, word-origin narrative and duplicate offer cards. Spectrum follows Designed in from the Start, then Regenerative Filmmaking and the Human Gift. Optional reading becomes three links. |
| About | Values and vision, foundation/LLC structure, then Who We Are with Bret and Andrew. Mission/vision synthesis comes from existing company copy. Removed duplicated services and the extra Explore What We Are Building button. |
| Work With Us | Booking and full contact details. Taller hero; existing 20-minute event retained. |
| Presentations & Labs | Audience, learning process and protected viewer. Specific session/deck detail stays here. |
| Production Services | Detailed Discovery, Design, Liaison and Story offers, town services and fees. About now gives a short description and link. |
| Production Reuse | Proposed operation and participation. Replaced an overly sweeping infrastructure headline and made the recipient-network invitation explicitly developmental. |
| Values & Vision | Longer treatment for deliberate reading. About now contains the core ideas without requiring this extra visit. |
| Word History | Full origin narrative. Homepage gives a short invitation; What We Do links here without retelling it. |
| Filmmaking & AI | Companion essay retained for deliberate longer reading. |
| Practical Moonshot | Companion vision retained. Time-sensitive figures/future scenarios are not newly certified by this audit. |

What We Do main-text count falls from approximately 1,375 to 830 words; About from 793 to 552. Counts strip markup/SVG from `main` and include headings/link labels. These reductions do not alter canonical Ledger prose.

## Contact and page-end decisions

Email and messaging controls share height, type size and treatment. Telegram uses `https://t.me/Bret_Warshawsky`, supplied by Bret. The homepage does not repeat the visible number/address beneath the controls and no longer has a contextual Back panel. Subpages retain their end links and browser Back behavior.

Recommendation adopted provisionally: keep a short homepage closing invitation so readers can act where they finish. Work With Us holds full details. An optional keep/remove preference was requested; the compact version is the stated default pending further direction.

The Ledger's repeated “The larger work is…” paragraph is removed. The existing byline/introduction already identify Social Effects NJ and provide the company link; another summary would repeat the same job.

## Ledger scroll finding

Reproduced on the prior script with a delayed web font: after wheeling down to about 1,980px, font completion/window load made multiple `scrollIntoView` calls and returned the page to about 574px. This is an asynchronous anchor reset, distinct from touch-screen momentum or small font-layout shifts.

The router now cancels pending font/feed/load anchor corrections after wheel, touch, pointer or scroll-key input. A route revision prevents an earlier section's stale callbacks moving a later one. Deliberate navigation resets the guard. The script reference is cache-versioned.

After the fix, the same probe makes no additional anchor calls and remains down the entries (about 1,924px after the font's natural layout change). The regression checks delayed fonts/window load and delayed news at 1366px and 390px, plus deliberate navigation after scrolling. Existing tests cover sixteen entries, legacy URLs/hashes, section clearance, keyboard navigation and responsive players. Physical-device inertial scrolling is not inferred from emulation.

## Color recommendation

Keep black for hero/footer, use one warm ivory for reading surfaces and gold for actions, and reduce rust-red to a small accent or remove it from main headings/links. Near-white variations and repeated full-width color changes contribute to the uneven feeling. No broad palette replacement is published here; that remains a visual decision for Bret.

## Validation

Company checks cover eleven routes at 1366/1024/390/320px: layout/menu, About order/anchors, absent duplicate practice blocks, contacts, reading-position restoration and direct-entry fallbacks. Actual-font desktop/phone screenshots cover About, spectrum/human gift and the homepage closing section. Third-party players are isolated for routing tests; messaging delivery and native-deck editing are outside this pass. Publication and live verification are recorded in the PR and shared TODO.

Final consistency follow-up: the word-history page no longer quotes a superseded homepage definition. Its One Wide Field paragraph now links directly to the current definition and the Ledger, avoiding another repeated definition. The remaining origin narrative is preserved.
