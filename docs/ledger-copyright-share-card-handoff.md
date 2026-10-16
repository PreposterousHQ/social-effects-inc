# Final Ledger copyright and share-card corrections

Date: 2026-10-16. Author: Filmanthropy Ledger / Codex.
Branch: `codex/ledger-copyright-share-card`.
Base: main `8ef2d1dac0081d3206e813efbed56379d5e4c3d6` (merged PR #10).

## Result and authorization

Bret requested the exact copyright line “© 2006 Social Effects NJ,” centered
immediately below “The Filmanthropy Ledger,” without the former Filmanthropy /
Regenerative Filmmaking suffix. The current Ledger now places that line inside
the title group, directly after the Ledger link. The archival Ledger's copyright
text is also corrected. The year 2006 is intentional, following Bret's wording.
The original round footer image, ring treatment and Social Effects NJ caption
remain as published in PR #10.

Bret also explicitly requested the existing shared-link image be made live
with “Social Effects NJ” replacing “Social Effects Inc.” The existing card was
text-edited with the built-in image tool, preserving the projector composition,
other labels and layout through visual review. It is normalized to 1200×630.
No footer artwork was generated or replaced in this pass.

The new card is `social-share-nj-v2.jpg`. Open Graph and Twitter image URLs in
all 22 Ledger-related HTML sources point to that fresh filename, including the
canonical short route, current/archive pages, 16 entries, `/ledger`, `/eva`
and `/vinati`. `social-share.jpg` serves the same corrected bytes for old image
references. The fresh metadata URL avoids reusing the old cached image address;
previously cached platform cards may still need their preview refreshed.

This is a fresh normal PR. Bret's current instruction to make these corrections
live authorizes publication after validation; no additional merge approval is
needed for this scope. The PR/shared checkpoint records the merge commit,
deployment and live verification when complete.

## Validation

`tests/ledger-final-branding.cjs` checks all 22 metadata sources for the new
Open Graph/Twitter image URL and actual 1200×630 image decode. Both image URLs
must serve bytes matching the corrected file. The unchanged metadata-only
pages are compared with the base to prevent unrelated edits; canonical essay,
case/card, AI and authorship text is compared in both Ledger renderers.

The footer is checked at 360px, 390px and 1440px for exact copyright text,
direct placement below the title, centering, no uppercase override and no
horizontal overflow. The original footer image and its brand caption remain.
Screenshots and the corrected share image are visually reviewed. The same
acceptance script supports `LEDGER_ORIGIN` for post-deployment checks.

External font/icon/player responses are substituted in browser checks; actual
platform card caches, app authentication and physical-phone QA are not claimed.
No bot, chat or social post is sent. The metadata title, description, canonical
URL and share-button destination logic are unchanged.

## Changed files

- `Filmanthropy_Ledger_v2.html`: copyright placement/text, image metadata and
  matching stylesheet version.
- `Filmanthropy_Ledger.html`: copyright text and image metadata.
- `assets/ledger-v2.css`: copyright typography in the title group.
- `entry-*.html` (16): only the Open Graph/Twitter image URL.
- `filmanthropyledger/index.html`, `ledger/index.html`, `eva/index.html`,
  `vinati/index.html`: only the image metadata URL.
- `social-share-nj-v2.jpg`, `social-share.jpg`: the corrected share card.
- `tests/ledger-final-branding.cjs`: targeted metadata/footer acceptance.
- `tests/ledger-sharing-footer.cjs`: current expected footer hierarchy.
- `docs/ledger-copyright-share-card-handoff.md`: this record.

The company homepage and its redesign copy Doc are not edited in this pass.
Future company navigation/page architecture remains separate work. No private
mirror/runtime synchronization is inferred.

## Image-edit provenance and final prompt

Tool: built-in image editing, using the existing `social-share.jpg` as the sole
edit target. Final web assets: `social-share-nj-v2.jpg` and the compatibility
copy `social-share.jpg`, both 1200×630 JPEG. The pre-edit source remains in Git
history; the edited source PNG is retained in the local task's output folder.

Prompt:

Use case: text-localization. Edit target: the supplied existing 1200 × 630 social share card. Make exactly ONE textual correction: the large white serif heading currently reads 'Social Effects Inc'. Replace ONLY 'Inc' with 'NJ' so the heading reads exactly 'Social Effects NJ'. Match the existing white serif font, size, weight, left alignment and baseline. Keep everything else unchanged: the antique projector, reels, camera position and proportions, wooden table, dark curtain background, warm golden light beam, gold rules, the small 'WRAP IT FORWARD' label, the sentence 'When the Reel Becomes Real.', the bottom socialeffectsnj.com address, all spacing and crop. This is not a redesign and must not be reimagined or restyled. Preserve the original 1200:630 aspect ratio and complete original composition, with no new elements and no changes outside the heading text area. Do not write 'Incorporated', 'Inc' or 'New Jersey'; the heading must say 'Social Effects NJ'. Return the corrected finished share card.
