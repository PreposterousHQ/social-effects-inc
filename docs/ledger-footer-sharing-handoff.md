# Ledger footer and sharing handoff

Date: 2026-10-16. Author: Filmanthropy Ledger / Codex.
Review branch: `codex/ledger-note-link-cache`, PR #10, based on main
`d3d8733639c6621c0e8faa5777c7532d8a8c1692`.

## Result

The current Ledger footer now places “The Filmanthropy Ledger” immediately
below “From Special Effects to Social Effects.” “Wrap It Forward” and
“Sets. Souls. Stories.” are removed from that footer; the share-strip heading
becomes “Share the Ledger.” Copyright and the existing illustration are
centered on phone and desktop. Bret asked to refine new artwork after the
other changes, so the generated concept is held outside the public repository
and the existing image remains in this review.

All page/essay/footer share controls in the current and archival Ledger now
use `https://socialeffectsnj.com/filmanthropyledger`. Entry shares and copy
controls use that canonical base plus `#entry-id`, preserving the selected
entry without leaking a preview host, query or the old HTML filename. The
archival entry renderer uses the same convention; old entry URLs still work.
The WhatsApp footer caption's “30 years” typo is corrected to “130 years.”

The former Instagram entry control was a dead `#` in the current renderer
and a generic Instagram homepage link in the archive. It is now explicitly
“Copy entry link for Instagram,” with a visible copy confirmation. This does
not promise an Instagram web-post composer or automatic posting.

The Social Effects homepage hero paragraph receives Bret's exact approved
replacement: “New Jersey is the fastest-growing major film state in the
country. We are here so that every production gifts its communities as much
as possible and leaves them more whole than it found it, and to build the
proof that filmmaking itself can be an act of care.” No other company-page
body wording is changed. Root homepage migration remains separate work.

PR #10 retains its cached-navigation correction: CSS/router URLs carry their
normalized-content digest. The updated versions must accompany these edits.
See [the note handoff](ledger-note-mobile-handoff.md) for the reproduced
old-router failure and regression.

## Validation and limits

The full normal-motion regression passes at 1440×1000 and 390×844, including
all 16 entry redirects, legacy `/ledger`, `/eva`, `/vinati`, the original
Ledger, `#fbr`, `#skater-girl`, case/Forerunners anchors, menu/note/history,
NJ-priority fixtures and responsive lazy playlists. Canonical essay, case
cards, entry data, AI prose and the required named framework phrase remain
preserved. The company source comparison allows only the approved sentence.

The sharing regression validates page controls and all 16 entries in both
Ledger renderers, including clipboard values and Instagram-copy feedback.
Composer launches are intercepted before contacting social services; nothing
is posted. Footer hierarchy, centering, image decode and horizontal overflow
are checked at 360px, 390px and 1440px. Screenshots were visually inspected.
The final run validates 208 sharing links, 34 intercepted composer launches
and 68 clipboard actions, with zero site JavaScript errors.
The stale-router regression also passes at 1440px and 390px. JavaScript
syntax and whitespace checks pass.

Browser tests substitute external fonts/icons/players and share composers.
They verify our destination payloads and launch behavior, not authentication,
native-app availability, completed social posts or third-party card rendering.
No physical-phone or private-mirror synchronization claim is made.

## Metadata work saved for the next copy pass

Both the current page and the canonical short-route HTML already serve
Open Graph and Twitter metadata. The metadata copy is deliberately retained:

| Field | Current value |
| --- | --- |
| Open Graph title | The Filmanthropy Ledger — The Gift in the Making \| Social Effects NJ |
| Twitter title | The Filmanthropy Ledger — The Gift in the Making |
| Description | A hundred years of giving in film, and the hundred to come. |
| Canonical / Open Graph URL | https://socialeffectsnj.com/filmanthropyledger |
| Image | https://socialeffectsnj.com/social-share.jpg |
| Image size | 1200×630, confirmed from the actual file |
| Card type | summary_large_image |

The footer concept is not substituted for this share image. Title, description,
thumbnail and alt wording remain a deliberate next discussion with Bret.
Entry hashes open the chosen entry in the browser, but all such canonical
hash links use the main Ledger preview metadata; entry-specific social cards
would require a separately reviewed approach. Existing entry HTML pages and
their metadata remain available at their old URLs.

Parameter formats for Telegram and WhatsApp were checked against the
[Telegram sharing documentation](https://core.telegram.org/widgets/share)
and [WhatsApp click-to-chat documentation](https://faq.whatsapp.com/5913398998672934).

## Changed files and publication boundary

- `Filmanthropy_Ledger_v2.html`: footer, share destinations/copy controls and
  matching asset versions.
- `Filmanthropy_Ledger.html`: archival share destinations/copy controls and
  canonical metadata URL; historical body wording remains intact.
- `assets/ledger-v2.css`: centered responsive footer and copy feedback.
- `assets/ledger-v2.js`: canonical entry-share URLs.
- `index.html`: only Bret's exact approved paragraph replacement.
- `tests/ledger-sharing-footer.cjs`: sharing and footer acceptance checks.
- `tests/ledger-round-2.cjs`: restrict the company-page exception to that sentence.
- `docs/ledger-footer-sharing-handoff.md`: this checkpoint.

These additions are kept in the already-open PR #10 rather than creating a
dependent second PR. No merge or production publication is authorized by the
new copy/footer instructions. The review description carries the current
preview, commit and final evidence. Shared TODO records the review checkpoint
and the separate private Google Doc for company-site editing.
