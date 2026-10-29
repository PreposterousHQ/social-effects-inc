# Social Effects NJ

Filmanthropy by Design and Regenerative Filmmaking.

Public repository and GitHub Pages deployment source for [socialeffectsnj.com](https://socialeffectsnj.com). Pages deploys main; review changes in a branch and pull request before publishing. Never place private project records, credentials or unapproved source files in this repository.

## Current routes

| Route | Purpose |
| --- | --- |
| / | Social Effects NJ company homepage |
| /schedule/ | Redirect to Bret's one-hour Calendly booking link |
| /our-practice.html, /contact.html, /team.html and linked pages | Company practice, services, booking and people |
| /ledger/ | The Filmanthropy Ledger |
| /new/ and its former HTML pages | Query/hash-preserving bridges to the launched company pages |
| /socialeffects/, /filmanthropyledger/, legacy Ledger filenames | Bridges to the company homepage or /ledger/ |
| /eva/, /vinati/, entry-*.html | Entry sharing/redirect routes |

The root and /ledger transition was authorized by Bret on 17 October 2026. See docs/root-ledger-launch.md and the launch PR for verification/publication status. Canonical company HTML lives at the root; /new HTML files are compatibility bridges, not editable page copies.

## Company and publication

The company describes Social Effects NJ as a developing foundation and LLC bringing research, education, entertainment and practical services together. The Ledger is its publication. The word Filmanthropy has a wider history documented on the site; it is not presented as a newly coined Social Effects term.

Company pages are root-level static HTML with shared new/site.css, new/revamp.css and new/site.js. Assets remain under /new, including authenticated encrypted-deck paths, so do not remove that directory. The canonical publication source is ledger/index.html. Canonical Ledger essay and case-study wording must be preserved unless Bret requests a specific edit. Entry routes use hashes matching the Ledger's entry keys. Sitemap and canonical/OG metadata identify the launched addresses; bridge pages remain noindex.

## Slide viewers

The proposal decks in new/decks remain password-protected encrypted snapshots. Do not commit passwords, plaintext exports or private source material there. Their public covers and captions identify the concepts without exposing the slides.

The two specifically approved public Moonshot decks are separate read-only image/PDF snapshots in new/moonshot-decks. They require fresh export and review after source edits. See scripts/package-moonshot-decks.cjs and docs/company-revamp-handoff.md for the refresh process.

## Custom sharing

data/share-cards.json and scripts/build-sharing.cjs maintain individual sharing metadata/images for all company pages, Ledger sections, cases and news. Static reader pages project Ledger sections and reports. Case-study share/copy controls use the original /ledger/#entry links; generated case-study routes and older entry aliases forward to those original entries while retaining individual preview metadata. Run the builder after source edits and --check before publishing; --render-images uses the existing Playwright/Chrome operator setup for visible card changes. Coverage checks require a record for every current page/item. Do not hand-edit generated reader HTML, assets/share-routes.js or data/share-manifest.json. The read-only Sharing integrity workflow checks freshness in PRs/main. See docs/custom-sharing.md for the source model, rendering/review process, Telegram pilot result and pending intake pipeline.

## Review and testing

Use the company, return-navigation, Ledger and deck tests under tests/ as appropriate to the change. Browser tests use Playwright; set LEDGER_BROWSER=chrome where supported to use installed Chrome. Protected-deck tests require a password file outside this repository.

docs/company-streamline-audit.md and docs/company-revamp-handoff.md contain dated design and implementation records. Later PR/deployment checkpoints supersede older preview-only statements. Drive and Google Docs remain creative reference surfaces where recorded; do not assume they automatically match the deployed HTML.
