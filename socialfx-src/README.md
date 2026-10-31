# Social FX founding pilot

TypeScript/React source for the first live release at `/socialF(X)/`. Compiled files are committed under that directory for the existing GitHub Pages deployment. The public site does not need a server framework or a DNS change.

## Run

```
npm ci
npm run check
npm test
npm run build
```

Serve the repository root with a static HTTP server and open `/socialF(X)/`. Build output uses versioned JS/CSS URLs. Source changes require a rebuild before publication.

## Scope and decisions

This is the first **browser-persisted** increment, not a complete operating platform. It includes canonical organization/contact IDs, zero-fee pilot participation, dated resources, the seven-lens Design Canvas, the Unbreakable Spirit rehearsal, partial allocations, simulated receipt, event records, and JSON/text exports.

`Simulation` and `My network` have separate storage keys. No contact data is sent to a server. Exported backups can be retained separately; import and cross-device synchronization are not implemented. Clearing browser storage removes these records. Multi-tab writes are serialized through Web Locks and edits require current record versions. Invalid stored snapshots are reported rather than silently overwritten.

No real AI, speech transcription, outgoing notification, payment, signature, route service, shared user account, or production booking is connected. Responses and costs are explicitly simulated. All seeded organizations are fictional. No real stakeholder is represented as an enrolled member or committed partner.

The original PostgreSQL/shared-accounts direction remains open implementation work. Browser storage is an interim delivery choice for this public first release on the current static host, not a substitute for that foundation. The earlier Windows D1/Vinext build was not deployed and was not recovered in this Linux environment. This version was rebuilt from the conversation and the saved checkpoint.

## Core behavior

- A conversation creates one organization, an optional contact and a zero-fee pilot invitation.
- Organizations can have several descriptive roles and both needs and gifts.
- Resource availability has dates, capacity, units, conditions and confirmation status.
- Production role-play checks availability against the entire exercise interval.
- A deadline change clears logistics confirmations. Resource edits clear uncommitted confirmations.
- Interest, storage, collection, onward delivery and fuel support must be recorded before allocation.
- Allocation cannot exceed remaining quantity. Receipt cannot exceed its allocation.
- Each successful command saves state and its event together in one browser-storage value.
- All simulation reports are labeled as exercise data rather than actual impact.

## Next increments

Review the first experience with Bret. Improve the service from that feedback, then add an authenticated shared relational database, organization permissions, source-linked intake, model adapter and voice capture. Actual inventory, movement/custody, capacity reservations, durable reminders, secure response links, report snapshots, provider agreements, memberships/coverage, education and wellbeing records need fuller models before operational use. Confirm funding and service terms before connecting payments or promising lifetime benefits.
