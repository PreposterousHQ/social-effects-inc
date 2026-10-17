# Company homepage and Ledger launch

17 October 2026. Bret explicitly authorized the previously planned root-homepage and /ledger transition with “do it”, selecting that next-step statement. This is authorization to publish the route change after verification; no DNS, mail, separate-domain purchase or audience message is needed.

## Sources and destinations

The approved PR #43 company pages, including both biographies, become the twelve root-level company HTML documents. The homepage is index.html; the publication is ledger/index.html. All company navigation, body links, footer links, canonical/OG metadata and publication sharing destinations use these addresses. Company pages are now indexable, with sitemap.xml linked from robots.txt.

The former /new HTML pages, /socialeffects/, /filmanthropyledger/ and both old Ledger filenames become small canonical, noindex bridges. JavaScript replace preserves queries and hashes without adding a duplicate Back step; no-JavaScript visitors get an ordinary continue link and refresh fallback. Publication bridges use the existing temporary migration marker so an older cached /ledger redirect cannot loop through its former filename. The live publication removes that marker immediately. All sixteen entry aliases and Eva/Vinati go directly to the corresponding /ledger/ entry hash, retaining their existing sharing metadata.

The company CSS/JS/images, public Moonshot snapshots and encrypted proposal-deck assets stay under /new. Those are asset addresses, not public company page addresses. Encrypted filenames are authenticated data: moving them would break authentication. Edit the root company HTML and ledger/index.html from now on. The former pages are bridges, not parallel editable versions. Prior sources remain recoverable from git at 0550ec5df559edff9b8280c9fb722f2ac2edb862. This launch introduces no new design or prose and leaves the current workshop/lab wording, approved Moonshot information and AI text as accepted.

## Acceptance and publication record

tests/root-launch.cjs compares all twelve company documents against the approved pre-launch files, allowing only route/indexing/canonical changes. It compares the complete Ledger against its pre-launch canonical source with only destination changes. Shared Ledger code, entries, styling, deck manifests/runtimes and CNAME remain exact. It checks all 41 discovered company internal destinations, every former /new page with query/hash preservation, old company/publication aliases, all sixteen entry aliases, Eva/Vinati, company/publication returns and a simulated cached /ledger loop. All passed without site errors or failed assets.

Updated active regressions pass on the launched addresses: company-revamp (twelve pages at 1366/1024/390/320px), company-return (native Back/Forward/exact reading position/reload/menu and booking at 1366/390/320px), moonshot-decks (all 21 slides, two PDFs, keyboard, full screen and failed-manifest/no-JavaScript fallbacks at four widths), private-decks (all 43 encrypted slides, wrong-password rejection, re-lock and locked reload at three widths), and ledger-contextual-sharing (182 links, 48 copy actions and 29 recipient landings across eight sections, sixteen entries and three reports, plus history/fallback/mobile bounds). An initial concurrent sharing run timed out on a history transition; the isolated complete rerun passed without an application-code change. The private test password was supplied through an operator file outside this public repository, then removed. Historical milestone tests with pre-launch source/route expectations are superseded for this launch by these active suites.

Actual-font homepage and Ledger captures inspected at 1366×768 and 390×844. Existing artwork and approved full-screen layouts are preserved. External player playback and real social posting are outside these routing checks. The Calendly address remains the previously verified twenty-minute event; no appointment is created.

The launch PR records its exact tested head, merge commit, Pages run and live verification. It supersedes prior handoff statements that the homepage and /ledger transition were future work once deployment succeeds. Rollback is a reviewed revert of the launch merge to the named pre-launch main commit, preserving prior assets; do not delete /new or alter DNS as a shortcut.

## Next work

Working reviewed text/audio/video story intake follows this homepage launch, per Bret’s explicit order. The present email intake is unchanged by this route-only launch. A separate Ledger domain remains a later intention. Neither is falsely marked delivered by this launch.
