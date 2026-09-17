# 3. Read v3 consent only from the services map

Date: 2026-09-17

## Status

Accepted

## Context

The v3 reader fell back to `details.consent.serviceIds.includes(ucId)` when the
service was absent from `details.services`, treating membership as consent.

`serviceIds` is not a list of consented services. It is a delta list whose
meaning is set by `details.consent.status`. From the vendor's shipped source
(`@usercentrics/cmp-web-sdk@1.0.0-beta.1`, `DpsModel.getConsentServiceIds()`, and
confirmed in the live Browser UI bundle at `web.cmp.usercentrics.eu`, which is
what a site actually loads): it is empty for
`ALL_ACCEPTED` and `ALL_DENIED`, holds the services *with* consent for
`SOME_ACCEPTED`, and the services *without* consent for `SOME_DENIED`. The CMP
stores whichever of the two lists is shorter, so `SOME_DENIED` is the ordinary
state for a user who accepts most services and refuses a few.

The CMP's own restore path negates membership to match:
`status === 'SOME_DENIED' && !consentData.serviceIds?.includes(serviceId)`.

So the fallback granted consent precisely when the user had denied — reachable
whenever a service is missing from `services`, which happens when it has been
removed from the CMP settings since the stored decision, or when `data-uc-id`
names something that was never configured.

## Decision

Read `details.services[ucId].consent.given === true` and nothing else. A service
that is not in the map is not configured in this CMP setting, and "not
configured" is not consent.

## Consequences

The inversion is gone. Two helpers went with the fallback, each of which carried
its own false grant: one accepted `svc.status`, which is the string marker
`'added'` for a newly configured service, and one accepted `consent.status`,
which is the v2 shape and does not occur in v3.

The change cuts both ways and the losing direction is real. Under a stored
`SOME_ACCEPTED`, a stale id for a removed service used to resolve to consent and
now does not, so an embed that used to load shows its placeholder instead. That
is the intended trade: failing closed is the right default for a consent gate,
and a service with no current CMP configuration has no live consent surface to
read.

This depends on undocumented vendor behaviour. The official interface reference
publishes `serviceIds` with no description at all, so the semantics above were
read from the shipped bundle rather than from documentation, and could change
without a changelog entry. The mitigation is that the decision removes a
dependency on that field rather than adding one.
