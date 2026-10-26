# ADR 0001: Static portfolio hosted on the homelab

- Status: Accepted
- Date: 2026-10-26
- Decision owner: PSEUDOEF

## Context

The portfolio needs to present client work, engineering demos, and a self-hosted case study to employers and clients. It will be served from `pseudoef.pp.ua` by nginx on a Moto G60 running Termux. The device has limited CPU, memory, battery, and process lifetime. The site should be easy to inspect, deploy, and recover without a toolchain.

The public site also needs a clear boundary between presentation content and the private homelab control plane.

## Decision

Build the portfolio as hand-written static HTML, CSS, and a small amount of vanilla JavaScript.

- No framework, package manager, bundler, or build step.
- No external fonts, CDNs, trackers, or hotlinked images.
- nginx serves files directly; Cloudflare Tunnel provides the public edge.
- Project cards use lightweight HTML/CSS interface sketches rather than screenshot assets. The Open Graph image is a local asset.
- The public demos are separate from the real admin panel. The real panel stays LAN-only and is not linked from the public site.
- CI runs a dependency-free Node validation script instead of installing a browser or HTML toolchain.

## Consequences

Positive:

- Every deploy is a file copy; recovery is simple and fast.
- There is no dependency drift or supply-chain surface from a build pipeline.
- The site is cheap to serve on constrained hardware and works without client-side rendering.
- The public/private split is explicit and easy to audit.
- Reviewers can read the source directly.

Negative:

- Content changes are manual edits rather than CMS or data-driven updates.
- Repeating contact details and project links requires discipline; the CI check catches broken local references but not stale copy.
- Screenshot and Open Graph updates are manual asset commits.
- There is no framework-level component reuse; shared visual language lives in CSS.

## Follow-up

- Replace placeholder screenshots with real captures when available.
- Revisit the architecture only if the content model or publishing cadence makes hand-written HTML a bottleneck.
