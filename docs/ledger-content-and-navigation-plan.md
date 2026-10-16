# Ledger content and navigation checkpoint

Latest checkpoint: follow `docs/ledger-homepage-redesign-handoff.md` for the
new introduction, six main choices, AI article transfer and Ledger-specific
menu. The How giving rises/information-box placement below records the prior
PR #7 layout and is superseded on this new review branch. The future root
migration and submission-workflow boundaries below still apply.

Author: Filmanthropy Ledger / Codex
Date: 2026-10-15, New York time
Base: main `9015ddb60b23b1db6a305c3cb802f3e529a96ae3`, after published PR #6.

## Current requested changes

The playlist boxes are labeled exactly `Videos From the Ledger` and
`New Jersey: News Items`. Playlist IDs, responsive sizing and lazy loading stay
the same. Stories from the Field says `Submit your stories here` and opens an
email to `bret@socialeffectsnj.com`, which Bret explicitly selected as the interim
submission destination in this conversation. This creates no sending worker or
automatic publication from inbound email.

Directly below How giving rises is the requested box:

> For more info on Social Effects, Filmanthropy and Our Offerings Please Visit www.socialeffectsnj.com/socialeffects

`/socialeffects` currently redirects to the existing `/index.html`, preserving
query and hash, so the link opens the existing Social Effects site now. The
root homepage itself is unchanged. The alias is a current entry point, not the
completed future homepage migration.

## New Jersey feed priority

The feed and the three main-page teaser headlines use the same ordering:

1. New Jersey stories, newest date first.
2. Other stories, newest date first.
3. Preserve source order when region priority and date are tied.

Add `"regions": ["US-NJ"]` to a feed item when its verified subject belongs to
New Jersey, including a multi-region item. A `place` containing the explicit
name `New Jersey` or abbreviation `NJ` is also recognized for existing data.
Do not infer NJ relevance merely from a company name or invent a source item
to demonstrate priority. The current three source-backed items are outside NJ
and remain unchanged. Fixture stories in tests are synthetic and never enter
the published JSON. Feed priority applies when someone adds items to the data;
no new automatic news discovery or recurring ingestion was installed.

## Agreed future direction

Bret intends the Ledger to become the root homepage at `www.socialeffectsnj.com`.
The current Social Effects website will be the content at `/socialeffects`.
Menus and the new version of that older site will be discussed separately.
This records direction and dependencies; it does not approve a root swap or a
specific replacement menu.

Before changing the root, preserve the current site as the real content behind
`/socialeffects` and replace its present `/index.html` alias. Then update and
test homepage, menu, canonical, asset and legacy-link behavior together. Do not
leave `/socialeffects` redirecting to the new Ledger homepage after the swap.
Existing Ledger routes, legacy entry pages and entry hashes must remain valid.

## Future Stories from the Field workflow

Bret clarified the intended sequence:

`form submission → alert to Bret → Bret approves → approved entry is published automatically`

The future form collects name, email, role, location, story, optional production
and link, plus explicit publication consent. Incoming submissions remain pending
and unpublished. Bret receives an alert, reviews the candidate and explicitly
approves or rejects it; approved content can then be added to the story data and
rendered automatically. Preserve consent and review provenance, prevent duplicate
publication, and retain an edit/unpublish path. An alert, a submission or elapsed
time does not count as approval. Publication of an approved story is distinct
from any new outbound reply to its submitter.

The form service, storage, alert transport, approval interface and publishing
integration still need selection and implementation. No form backend, alert,
approval worker or automatic story-entry creation is claimed in this pass.
Email submissions are the explicitly chosen interim path. Foundation/business
page decks, mission copy and password are also still a separate future decision.

## Ownership and future edits

Verification: the updated desktop/mobile regression passes at 1440×1000 and
390×844, including exact labels and information text, card/email navigation,
working `/socialeffects` query/hash redirects, feed-only Happening Now and all
prior entry/anchor checks. Synthetic fixtures verify name/abbreviation/metadata
NJ detection, NJ-first date ordering and matching hub teasers. Source news JSON,
the current homepage and canonical essay/case-study/full-entry text are unchanged.
Desktop/mobile screenshots were inspected; syntax and whitespace checks pass.

The actual site repository and its reviewed PRs own code and implementation
status. Read current main and this checkpoint before dependent routing work.
Use a fresh branch and normal PR, preserve canonical essay/case-study wording,
and test changed behavior. Merge/publication follows Bret's current explicit
authorization. This source supersedes earlier page text claiming all story
submissions are unavailable, but preserves prior PRs as historical evidence.
