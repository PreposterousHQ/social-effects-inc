# Social Effects NJ

Filmanthropy by Design and Regenerative Filmmaking.

Public repository and GitHub Pages deployment source for [socialeffectsnj.com](https://socialeffectsnj.com). Pages deploys main; review changes in a branch and pull request before publishing. Never place private project records, credentials or unapproved source files in this repository.

## Current routes

| Route | Purpose |
| --- | --- |
| / and /socialeffects/ | Existing company site |
| /new/ | Live, noindex company redesign under review |
| /filmanthropyledger/ | The Filmanthropy Ledger |
| /eva/, /vinati/, entry-*.html | Entry sharing/redirect routes |

The later /new/ to root homepage transition and desired /ledger address are launch work, not current routing. Do not change those routes based on this plan alone. See the current handoff and PR publication records.

## Company and publication

The company draft describes Social Effects NJ as a developing foundation and LLC bringing research, education, entertainment and practical services together. The Ledger is its publication. The word Filmanthropy has a wider history documented on the site; it is not presented as a newly coined Social Effects term.

Company pages are static HTML with shared new/site.css, new/revamp.css and new/site.js. Canonical Ledger essay and case-study wording must be preserved unless Bret requests a specific edit. Entry routes use hashes matching the Ledger's entry keys.

## Slide viewers

The proposal decks in new/decks remain password-protected encrypted snapshots. Do not commit passwords, plaintext exports or private source material there. Their public covers and captions identify the concepts without exposing the slides.

The two specifically approved public Moonshot decks are separate read-only image/PDF snapshots in new/moonshot-decks. They require fresh export and review after source edits. See scripts/package-moonshot-decks.cjs and docs/company-revamp-handoff.md for the refresh process.

## Review and testing

Use the company, return-navigation, Ledger and deck tests under tests/ as appropriate to the change. Browser tests use Playwright; set LEDGER_BROWSER=chrome where supported to use installed Chrome. Protected-deck tests require a password file outside this repository.

docs/company-streamline-audit.md and docs/company-revamp-handoff.md contain dated design and implementation records. Later PR/deployment checkpoints supersede older preview-only statements. Drive and Google Docs remain creative reference surfaces where recorded; do not assume they automatically match the deployed HTML.
