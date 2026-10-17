# Custom sharing: first live test group

17 October 2026. Bret approved the four black/gold previews and explicitly requested pushing them for a live test before extending to all sections and stories. This phase publishes four approved PNGs byte-for-byte: the company homepage, the Ledger homepage, Spielberg’s Schindler’s List case study, and the Texas Clean Hands reported pledge. It does not claim the rest already have individually designed previews.

## Publishing sources and lifecycle

data/share-cards.json owns the four cards’ approved headline/description, visual fields, canonical address and reference to the actual content record. Existing assets/ledger-entries.js and data/happening-now.json remain the sole narrative sources. The generated case/report pages read those records, including their caveats, statistics and sources; do not edit their output HTML by hand. Main company and Ledger body copy remain in their existing HTML. The generator changes only their metadata and the declared sharing helper/script references.

scripts/share-card-template.cjs is the shared design. Original projector-heart.jpg is reused. The four approved 1200×630 PNGs live in assets/share with content-hashed filenames. scripts/build-sharing.cjs validates each image signature, dimensions, filename digest and design-input fingerprint. If the visible card inputs or template change, it requires a new render and review instead of silently reusing stale art. Description-only corrections can update metadata without redrawing the image. No AI image generation, external image acquisition, source re-scraping or new factual claims are performed.

For an approved story, add/update its canonical content record and sharing record, then run:

    node scripts/build-sharing.cjs --render-images
    node scripts/build-sharing.cjs --check

Rendering uses the repository’s existing Playwright/Chrome operator environment (available through NODE_PATH), the same Google Fonts used by the site, and a localhost-only render server. Inspect the new images before publishing. Rasterized PNGs need no font service for viewers. Ordinary generation/checking requires only Node built-ins; it does not run a browser or fetch fonts. Existing approved images are reused exactly. The template and original-art bytes are part of the image fingerprint; text fingerprints normalize line endings across Windows/Linux. The read-only Sharing integrity workflow runs the generation check for PRs/main using pinned official actions and Node 22. Pages continues to serve the reviewed committed static output through its existing main deployment. The check neither auto-merges nor invents publication approval. No old images are automatically deleted.

## Addresses and readers

The homepage and /ledger keep their existing working canonical addresses. The two tested stories get ordinary, 200-response static articles:

- /ledger/case-studies/schindlers-list/
- /ledger/news/clean-hands-brookes-house/

Each contains its own Open Graph/X metadata and complete readable story in the initial HTML, with JavaScript disabled. There is no user-agent-specific response, hidden redirect or crawler-only content. The Spielberg page includes the existing verdict, all statistics, narrative paragraphs and quoted attribution. The news page retains the reported-one-source label, original source link, pledge wording and follow-up requirement. Copy and service links use that article’s canonical address; a readable copy fallback handles missing/denied clipboard access. Header links lead to the Ledger and company; no repeated footer Back panel is added.

assets/share-routes.js is generated from the registry and loads before Ledger sharing code. Only the two pilot story keys select the new article addresses; all other current section/entry/news links keep their existing hash destinations. Both modal/strip and feed/copy actions consult the mapping. The old entry-schindlers-list.html alias now carries the same card metadata and lands on the new full article; the existing /ledger/#schindlers-list modal still works. The two new articles are in sitemap.xml.

The new company cover also replaces the old generic image as the fallback on company pages/bridges. The new Ledger cover is the fallback on publication/entry aliases. Their existing non-pilot titles/descriptions are retained for now. This removes the old real/reel slogan from new fallback previews without pretending every remaining page has a unique card. Versioned PNG filenames prevent reusing the old image address; platform page caches are independently controlled by each platform.

## Verification and next gate

tests/custom-sharing.cjs checks reproducible generation, unaltered canonical narrative data and company bodies; no-JavaScript initial metadata; four real 1200×630 images; complete case/report content; responsive article layouts and composer/copy destinations at 1366/1024/390/320px; the existing modal/feed/strip/copy routing, legacy alias, native Back and clipboard fallback. It also compares every original Ledger view with the pre-pilot source. tests/ledger-contextual-sharing.cjs retains all sections/entries/reports, with expected URLs read from the pilot manifest. Sharing checks inspect composers/recipient landings and never send a post.

Publication PR/shared TODO record exact validation, merge, Pages run and live checks. Actual Facebook/X/LinkedIn/Telegram previews and cache behavior must be checked on those platforms after publication; crawler-equivalent HTML checks are not claimed as platform screenshots or successful re-scrapes. Bret explicitly requested this live test group first. Extend individual images, metadata/routes and tests to the remaining sections/cases/news after that feedback. Section-page generation beyond company/publication/case/report is still next-phase work, not delivered by this pilot.

Local acceptance passed before publication: custom-sharing checks at 1366/1024/390/320px, all four initial metadata/image responses and the two complete articles; the full contextual regression checked 182 composer links, 48 clipboard actions and 29 recipient landings across eight sections, sixteen entries and three reports. History, overflow and denied-clipboard fallback checks passed with no JavaScript errors or posts sent. Desktop and phone article captures were visually reviewed with the actual fonts. A fresh image-generation pass reused the four approved PNGs without changes.

filmanthropy.live and filmanthropyledger.com remain Bret-reported registrations awaiting a separate connection decision. No registrar/DNS/canonical-domain change occurs here. The reviewed media-intake form remains separate open work.
