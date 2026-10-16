# Opening space and a clearer laptop menu

2026-10-16 — Filmanthropy Ledger / Codex

Base main: `ad151d92f47b6066a1047c1e912b37387b4ff495` (published PR #13).
Bret requested removal of the opening “A Living Record · Think Outside the
Frame” line, pulling the opening upward so Explore the Ledger is fully visible,
and removing the hyperlink from the introductory “by Social Effects NJ.” He
also asked whether the busy menu should have more space or become a hamburger.

The requested opening tagline is removed and the byline is plain text. Hero
padding and the gaps around the title, byline, paragraphs and Explore button are
reduced; body copy, title sizes and all approved prose remain unchanged.

The proposed menu treatment uses a visible **Menu** label plus hamburger on
screens narrower than 1600px, including ordinary laptop widths. The full row is
retained for wide desktops, with larger link text and increased horizontal
padding. The existing accessible overlay, keyboard focus trap, Escape/close,
menu links and submission action are reused. Its resize boundary matches the
new breakpoint. The header identity still returns to the Ledger opening; the
company-information link in the final opening paragraph remains linked.
At Bret's follow-up request, the **Social Effects NJ** caption beneath the
footer illustration also links to `/socialeffects`, the existing company page.
It retains its centered appearance and has a 44px minimum click/tap height.

Real site-font layout checks passed at 1280×600, 1366×600, 1440×700, 1536×700,
1920×900, 390×844, 360×800 and 320×720. The Explore button ends at y=521–534 in
the laptop/desktop checks and y=737/731 on the 390/360px phones, fully inside
those viewports. At 320×720 the full copy scrolls naturally (button y=779), while
the header/menu remains clear and the page does not overflow horizontally. No
clipping or shrinking of body copy is introduced to force every short viewport
to fit. Playfair Display, DM Sans and DM Mono loaded for these layout checks;
screenshots of the laptop and phone openings were inspected.

Existing focused normal-motion navigation checks passed at 1440×1000 and
390×844: exact approved introduction, choice/menu order, byline/tag removal,
canonical address and cached former-alias migration, featured entries,
Forerunners landing, AI/note navigation, mobile keyboard/menu behavior,
submission, news feed, lazy responsive playlists, the footer caption's actual
navigation to the company homepage, and NJ ordering fixtures.
Legacy/alias/16 entry URLs return HTTP 200; canonical article/data comparisons
remain unchanged; no site JavaScript errors. Cached-router note checks and
stylesheet-version checks pass at 1440/390px. External fonts/icons/players are
substituted only in the broad navigation regression; physical-device behavior
and actual external video playback are not asserted. Whitespace checks pass.

Changed: canonical HTML, `assets/ledger-v2.css` and its content-derived version,
the two existing menu/navigation tests, this handoff. No image, sharing,
metadata, news data, router or company-page change. Future edits remain in
`filmanthropyledger/index.html`. The PR records the tested commit and review
status. Bret subsequently instructed that all these changes be merged and made
live, including the footer caption link. This authorizes the combined PR #14
publication; verify its exact deployment and live behavior before claiming it.
The separate company-opening wording discussed afterward remains a proposal.
