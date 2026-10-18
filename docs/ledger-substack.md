# Social Effects on Substack

## Current: approved chat invitation

On 18 October 2026 Bret approved replacing the article preview with a linked invitation to **Filmanthropy by Design & Regenerative Filmmaking**, https://substack.com/chat/group/040c8908-4a54-4103-bf1f-2ce11d96c0e9 . It appears below both YouTube playlists, next to the Social Effects series/archive link, and opens the chat in a new tab so the Ledger remains available. The card clearly explains Substack sign-in/subscription access.

This is a **linked chat invitation, not an embedded chat feed**. The chat's verified framing policy excludes the company domain. No private chat messages are copied to the site, and no Substack account, subscription, chat access or notification settings are changed. There is no new backend or external widget script. Evidence and rollback instructions: [substack-chat-preview.md](substack-chat-preview.md).

Canonical markup remains in `ledger/index.html`, with scoped styles in `assets/ledger-v2.css`. Run `node scripts/build-sharing.cjs` after stylesheet edits to refresh the asset version and `--check` to verify generated sharing remains current. `tests/ledger-substack.cjs` covers the linked invitation at 1366/768/390/320px, both retained playlists, exact new-tab destination, menu/Back and the actual subscriber gate. It never joins, subscribes or sends a message.

## Previous article version, retained for rollback

Bret supplied https://thesyntonytimes.substack.com/s/social-effects for the requested addition below the Ledger's two YouTube playlists. The public section currently lists one post, **The Giants Who Did It First** by Bret Warshawsky: https://thesyntonytimes.substack.com/p/the-giants-who-did-it-first . The public archive and article were read directly in the browser.

PR #49 included that post's native preview under **The Ledger, one story at a time.**, beside a link to the exact Social Effects section. The embed code was obtained from the article's **Share → More → Embed** interface, following [Substack's official instructions](https://support.substack.com/hc/en-us/articles/25665267911572-How-do-I-embed-Substack-posts-or-notes-on-a-website). Its text/title/article-link fallback worked if JavaScript was disabled or the external loader was blocked. No third-party feed service, backend or subscription signup integration was added.

This is a **curated article embed**, not an automatically updating archive feed. The native card can refresh the embedded article's presentation, but it will not select each newly published post. To feature another article, obtain its native embed from Substack and replace/add the approved block in `ledger/index.html`. The archive link always opens the Social Effects section in a new tab. The native card contains Substack's own publication identity, Subscribe and sharing controls; no subscription, like, restack, comment or message was submitted during setup.

The broader publication currently presents itself as **A Civil Rights Moviement for the Soul**, with a mental-health description. Accordingly, the site labels this as the Social Effects series and does not add a separate general-publication signup form or imply that all publication content concerns Social Effects. The embedded article retains its original cover, title and description; no Substack article or account setting was edited.

The responsive section styles are scoped in `assets/ledger-v2.css`. Run `node scripts/build-sharing.cjs` after editing this stylesheet to refresh the Ledger's asset version, then `--check` to verify generated sharing remains current. Existing custom-card records and all case/news/AI narrative stay unchanged.

The PR #49 version of `tests/ledger-substack.cjs` exercised the real native preview at laptop, tablet and phone widths, frame/document overflow after fonts/styles loaded, exact article/archive destinations, placement below both playlists, browser Back and script-disabled/blocked-loader fallbacks. It never subscribed or posted. Screenshots hid the fixed navigation only during isolated section capture, so the header did not obscure the tall mobile card. That article test remains recoverable with its source version.

The first layout probe ran before the third-party frame's stylesheet settled; waiting for its load/fonts removed the apparent 8-pixel overflow. Navigation acceptance uses the fixed menu to open the AI section from the bottom of the page, then native Back to return. An initial probe's long programmatic jump to a distant offscreen card did not produce a click at narrow widths; it is not evidence that every card click was verified here. The menu journey passes without a production routing change.

## Separate question: Discussions

Bret asked how to create a thread appearing under Substack's Latest / Top / Discussions tabs. [Substack's official engagement guide](https://on.substack.com/p/how-to-engage-readers-substack) describes a separate discussion-thread format and a **New thread** dashboard control. That guide is older. The current public section shows the Discussions tab, but the current signed-in creation control could not be verified because the browser connection was unavailable. Do not claim that the current button label, placement or successful tab inclusion was tested. No draft or discussion was created, and no subscriber notification was sent.
