# Custom sharing

17 October 2026. Bret tested the four approved pilot cards in Telegram and its webpage bot and reported that all four worked well. He then authorized extension to every distinct page, section, case and report, and gave “k” to publish the ready batch. That evidence is user-reported Telegram acceptance; it is not a claim of tests on other social platforms.

## Coverage

The registry now covers 39 distinct destinations: twelve company pages, the Ledger homepage, seven Ledger sections, sixteen case studies and three reported news items. Each has a custom title, description, image and canonical URL. The four original approved PNGs remain byte-identical. Thirty-five additional PNGs reuse the exact approved black/gold projector template and existing artwork.

Company page addresses remain unchanged. Every Ledger section, case and report has a complete static reader page with its own metadata in the initial HTML. The seven section routes are:

- /ledger/essay/
- /ledger/case-studies/
- /ledger/filmanthropy-and-ai/
- /ledger/happening-now/
- /ledger/stories-from-the-sets/
- /ledger/submit-your-story/
- /ledger/note/

Individual cases use /ledger/case-studies/{entry-id}/ and reports use /ledger/news/{report-id}/. The original /ledger/#section and modal navigation remain working; their share/copy controls now select the corresponding static URL. The essay’s inline share group also selects its own essay URL. Legacy entry, Eva/Vinati and company aliases carry the corresponding metadata and lead to their current page.

Section readers retain the existing essay, AI, contribution and authorship paragraphs. The essay is fully expanded and has working chapter links. Case and news indexes link to complete individual articles. Cases preserve all narrative paragraphs, deliberate inline emphasis/links, statistics, provenance, quotes and caveats. Reports retain source labels, source links, related cases and follow-up requirements. This rollout does not change research records, the AI argument, company body copy or the interim intake mechanism.

## Sources and publishing

data/share-cards.json owns the per-item presentation: headline, caption, description, canonical address, source reference, image and design fingerprint. Canonical narrative remains in assets/ledger-entries.js, data/happening-now.json and ledger/index.html. Company body copy remains in the existing page HTML.

scripts/build-sharing.cjs generates metadata, complete reader pages, the route map, sharing manifest and sitemap entries. scripts/sharing-content.cjs projects the existing section content and checks internal destinations; it does not create a second editorial source. Do not hand-edit generated reader HTML, assets/share-routes.js or data/share-manifest.json.

scripts/share-card-template.cjs is the unchanged approved design, using existing projector-heart.jpg. PNGs are 1200×630 with content-hashed filenames. The generator validates PNG signatures, dimensions, digest and design-input fingerprint. Visible-card changes require a new render and visual review. Description-only corrections do not require redrawing art. The template and original-art bytes are included in the fingerprint; text fingerprints normalize Windows/Linux line endings.

For an approved content change:

1. Edit its canonical narrative source and review its public summary.
2. Add or update the corresponding sharing record.
3. Run `node scripts/build-sharing.cjs --render-images`.
4. Inspect new cards, then run `node scripts/build-sharing.cjs --check` and the relevant sharing acceptance checks.
5. Publish only the reviewed tested commit.

Rendering uses the existing Playwright/Chrome operator environment via NODE_PATH, the site’s fonts and a localhost-only render server. Readers receive rasterized PNGs and do not need a font service for the card image. Ordinary generation/checking uses Node built-ins only, without a browser or network. Existing approved images are reused exactly. Old images are not automatically deleted.

Coverage assertions require a record for every company page, entry, news item and Ledger section, so new content cannot silently fall back to the old generic artwork. The read-only Sharing integrity workflow validates generated output on PRs/main using pinned official actions and Node 22. It neither approves nor auto-merges changes. Existing GitHub Pages hosting and main deployment remain unchanged.

## Verification

tests/custom-sharing.cjs checks every registry item’s initial metadata and real image, complete narrative/section text, unchanged company bodies and Ledger content, responsive reader layouts, compositor/copy destinations, internal targets, all legacy case aliases, browser Back and denied-clipboard fallback. tests/ledger-contextual-sharing.cjs checks the current Ledger navigation, eight sections, sixteen cases and three reports. The checks inspect links without sending a post.

All 39 raster cards were visually reviewed in contact sheets. Representative section readers were reviewed with actual fonts on desktop and mobile. Publication PR/shared TODO record exact test results, commit, CI, Pages and live verification. Platform caches remain controlled by each platform. Bret’s Telegram result closes the requested pilot gate; other-platform testing is deferred at his direction.

The pending hero byline change is included: “Social Effects NJ” links to the main homepage in the existing light-gold style.

## Intake and next work

Bret’s priority after this sharing rollout is live: implement reviewed text/audio/video story intake, then research a suitable Substack embed below the Ledger’s YouTube playlists.

The small pipeline is form service → private submission/draft → Bret’s approval → canonical publication record + sharing record → generator/checks → reviewed deployment. Tally now owns intake and media storage; Bret chose draft review here, followed by agent-assisted publication of the approved version. The working embed, notification test and consent workflow are recorded in [story-intake.md](story-intake.md). No inbound submission, attachment or source text is publication authority. Keep unapproved contributions, private emails and media access URLs out of the public repository. This is reviewed publication, not an automatic webhook publisher.

filmanthropy.live and filmanthropyledger.com remain Bret-reported registrations awaiting a separate connection decision. No DNS/canonical-domain change occurs here.
