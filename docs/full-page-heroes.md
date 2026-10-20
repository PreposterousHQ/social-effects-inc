# Full-height page heroes

Prepared 20 October 2026 at Bret's request and approved for publication by his subsequent “k”.

Values & Vision and the other secondary company-page heroes use the same minimum height as the main pages: the stable viewport minus the fixed 84px navigation. Shared styling lives in `new/revamp.css`. Removed the obsolete fixed 520px / 400px banners and redundant 640px / 480px practice/About overrides. Existing imagery, text and vertical centering stay intact. Long content can expand naturally on short screens.

Company source pages request CSS v30; the sharing generator carries that version into the four Deeper Dives readers. Sharing cards, content and metadata remain unchanged. Run `node scripts/build-sharing.cjs --check` after future generated-reader changes.

Actual-font rendered review covered 18 current opening pages (13 company pages, four Deeper Dives readers, Ledger) at 1366x768, 1440x900, 1920x1080, 1024x768, 390x844, 320x568 and 844x390. All 126 checks passed: hero reaches the screen bottom, heading/controls stay inside, no horizontal overflow. Existing company navigation, menu focus and route checks passed at four widths. Private QA script/screenshots are under the parent workspace's drafts/audit-all-heroes.cjs and drafts/all-hero-preview, outside the public repository.

The unrelated unpublished AI-essay image remains a private preview in the parent workspace. It is not included in this site change.

The same approval included linking Filmanthropy by Design and regenerative filmmaking in the private essay. The public practice page now exposes the descriptive anchors `#filmanthropy-by-design` and `#regenerative-filmmaking` for those existing sections, without changing their copy.
