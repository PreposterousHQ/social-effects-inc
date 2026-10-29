# Original case-study restoration and site audit — 29 October 2026

## Delivered change

All 16 case-study share destinations use `/ledger/#<entry>`. The case index, essay projections and related-news links also link directly to the originals. Existing `/ledger/case-studies/<entry>/`, `/entry-<entry>.html`, `/eva/` and `/vinati/` links forward to the original entries. Forwarding pages retain the existing individual sharing images and metadata. The generator implements the change so rebuilding cannot restore the alternate layouts. Redirect routes have been removed from the sitemap.

Original editorial records, Ledger JavaScript/CSS, company page bodies, approved share images, news data, intake integrations and protected decks are unchanged. README and sharing tests reflect the new contract. The focused static regression runs in the existing sharing-integrity workflow.

## Verification

- Generator freshness and all 45 image records pass.
- Focused regression covers all 16 destinations, alias redirects, sharing URLs, retained preview-image references and sitemap exclusion.
- Source audit examined 82 HTML files and 1,206 internal href/src references: no missing local file targets or duplicate IDs. Anchor warnings were virtual Ledger entry keys and preserved legacy bridge hashes, rather than missing destinations.
- Browser preview verified all 16 case-study paths land on the matching original open entry, with matching social-share destinations and no horizontal overflow at the available desktop viewport.
- Browser inspection covered all 13 company pages, the Ledger opening and eight section views, and seven standalone section pages. Those inspected states had no horizontal document overflow or completed broken images. Next-entry navigation from Skater Girl reached Sing Sing.
- Source diff confirms canonical case text, company bodies, Ledger styles and entry logic remain unchanged.

## Findings and follow-up opportunities

1. Alternate layouts also exist for Ledger sections (essay, case index, news and other sections). This change restores the individual case studies requested; those other layouts remain as they were.
2. Hash destinations normally receive the main Ledger's preview when pasted directly into social platforms. Individual metadata remains available on the older forwarding URLs, but platform treatment of client redirects varies. No social post was submitted; cached external previews were not tested.
3. Company homepage copy says the Skater Girl skatepark was “built for the film,” whereas the case emphasizes that it opened before filming and was designed for community use. Consider aligning that summary in a separate editorial change.
4. Some original Skater Girl prose contains awkward punctuation and a construction sentence that needs a copy-edit. These are reported rather than rewritten because preserving the original content was the priority.
5. Return-to-entries behavior uses browser history. During repeated same-document hash navigation in the audit, it could return to an earlier section page. A focused history-navigation review would clarify edge cases before changing the existing routing logic.
6. Footer copyright is intentionally 2006 according to existing repository tests; it was preserved.

## Limits

This is a source and desktop-rendering audit, not a full independent factual verification of every claim or a live external-link availability crawl. Mobile viewports, protected deck access, external booking/form submissions, keyboard-only flows across every page and social-platform cache behavior were not exercised. No forms were submitted. Existing browser automation tests were updated for the restored routing but not run in this environment; direct preview checks used the supported browser instead.

## Follow-up: live mobile and external workflow tests

- At 390 × 844 CSS pixels, all 13 company pages and eight Ledger views had no horizontal document overflow or completed broken images. This is responsive Chrome testing, not a physical iPhone/Android test.
- At 320 × 740, all 16 case redirects opened the correct original entry. However, every entry's share row extended to about 325px inside its 320px panel. The copy control was partly clipped, and the share controls measured 28 × 28px. Recommended fix: allow the row to wrap and increase phone touch targets without changing the original visual language. This defect is still open.
- Company mobile navigation opened correctly; Escape closed the menu and restored focus to its trigger.
- Confirmed return-navigation defect: after a direct Skater Girl landing and Next/Previous, Back to entries returned to the company homepage in the tested history sequence. The existing history.back() behavior is still open; it should reliably target the case index.
- The embedded Tally form loaded at narrow widths, dynamically resized, showed its upload control and 10 MB limit, and rejected missing required answers with visible errors. Its separate-window form loaded too.
- Sent exactly one text-only synthetic entry from the 390px embedded form, labeled TEST—DO NOT PUBLISH, using codex-audit@example.com and selecting contact-before-publication. The form showed its thank-you page. Tally's API confirmed completed record KprP8EK at 2026-10-29 19:08:03 UTC (3:08:03 PM EDT), with the expected text and permission choice. The corresponding Tally notification reached Bret's bret@bretwarshawsky.com inbox. The test record and notification are retained and clearly identified as tests. No media was uploaded.
- /schedule/ correctly opened the one-hour-call Calendly URL. The actual event is named 55 Minute Exploration and lasts 55 minutes; October 30 showed selectable time slots. No appointment was booked. The company contact page links to the separate 20-minute event; its rendering could not be verified reliably after a browser timeout.
- Temporary viewport overrides were reset. No site source or form configuration was changed during these follow-up tests.

The follow-up supersedes the earlier limitations about mobile, text submission and notification delivery. Media-upload delivery, a physical-device/browser matrix, a completed Calendly booking, and social preview caches remain untested. Prioritize the narrow share row and deterministic Back to entries behavior, then editorial consistency.
