# vappfe — Frontend Setup Guide

This guide gets the Angular frontend running locally from a clean clone. No Docker is needed here — just Node, npm, and a running backend to talk to.

## Tech Stack

- **Framework:** Angular v21 (standalone components)
- **UI Library:** [ng-zorro-antd](https://ng.ant.design/components/overview/en) — Ant Design's official Angular implementation. When building or modifying any UI, check the component docs here first before hand-rolling something custom.
- **QR generation:** `angularx-qrcode`
- **QR/barcode camera scanning:** `@zxing/ngx-scanner` (built on `@zxing/browser` + `@zxing/library`)
- **Device fingerprinting:** `@fingerprintjs/fingerprintjs` (used for kiosk device identification)
- **Testing:** Vitest (not Karma/Jasmine — this is Angular's newer default)

## Prerequisites

| Tool                           | Version                                                                                                                         | Notes                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/) | Compatible with Angular v21 — check the [Angular version compatibility table](https://angular.dev/reference/versions) if unsure | Match whatever version the backend uses on the same machine to avoid juggling two Node versions    |
| npm                            | `10.9.2` (pinned via `packageManager` field)                                                                                    | Corepack will respect this automatically on recent npm/Node versions                               |
| The **backend** (`vappbe`)     | —                                                                                                                               | Must be running first — see that project's README. The frontend has nothing to talk to without it. |

Verify:

```bash
node -v
npm -v
```

## 1. Clone and install dependencies

```bash
git clone <repo-url>
cd vappfe
npm install
```

## 2. Configure the environment file

Unlike the backend, API connection details here live in a plain TypeScript file (not `.env`), since none of it is sensitive — it's just the backend's URL/port.

Check `src/environments/environment.ts` (and `environment.development.ts` if present) and confirm it points at wherever your backend is actually running:

```typescript
export const environment = {
	production: false,
	apiPort: 3000 // match whatever port the backend README says it runs on
};
```

If you're developing on the same machine as the backend, the defaults should just work. If you're pointing at a backend running elsewhere on your LAN (e.g. testing against the on-prem macOS server), update this to that machine's address instead.

## 3. Run the dev server

```bash
npm start
```

This runs `ng serve`, available by default at **[http://localhost:4200](http://localhost:4200)**.

## Working with ng-zorro-antd

This project uses ng-zorro-antd as its component library — before building any UI element (buttons, forms, modals, tables, cards, etc.), check whether a component already exists for it:

📖 **[ng-zorro-antd component docs](https://ng.ant.design/components/overview/en)**

Import only the specific module(s) you need per component (e.g. `NzButtonModule`, `NzCardModule`) into your standalone component's `imports` array — this project does not use the older `NgModule`-based global import pattern.

## A few things specific to this project worth knowing

### Camera access requires a secure context

`@zxing/ngx-scanner` needs camera permission from the browser, and browsers only grant camera access on **secure contexts** — `https://` or `http://localhost`. This works fine in local dev (`localhost:4200`), but once this is deployed to the on-prem LAN server for real kiosk use, that server needs HTTPS (even via self-signed cert) or the camera-based QR scanning on `/qrcode` will silently fail to request permission at all. This is a known open item on the project — see the backend README's architecture notes for the kiosk HTTPS setup that's still pending.

### FingerprintJS is used for kiosk identity, not analytics

If you see `@fingerprintjs/fingerprintjs` being called, it's part of the kiosk device-registration flow (identifying a specific physical device across sessions so re-registration updates the same record instead of creating duplicates) — not user tracking/analytics. Worth knowing so it doesn't look out of place if you're new to the codebase.

### Testing uses Vitest, not Karma

```bash
npm test
```

If you're used to older Angular projects with Karma + Jasmine, note this project has moved to Vitest — syntax is similar (`describe`/`it`/`expect`) but the runner and config are different.

## Useful Commands Reference

| Command         | What it does                                    |
| --------------- | ----------------------------------------------- |
| `npm start`     | Run dev server at `localhost:4200`              |
| `npm run build` | Production build                                |
| `npm run watch` | Development build in watch mode (no dev server) |
| `npm test`      | Run tests via Vitest                            |

---

If the app loads but every API call fails, the backend probably isn't running — check its README first, starting with `docker ps` to confirm Postgres is up.

---

# Branching Strategy & Procedure

## Branches

- **`main`** — the clean, working development branch.
- **`staging`** — the working branch for other developers/QA to test on their own machines.
- **`production`** — the live, working branch.

## Rules

1. **No direct pushes** to `main`, `staging`, or `production`. All changes must go through a branch and a pull request.
2. **Every feature must have its own branch.**
3. **All feature branches merging into `main`, `staging`, or `production` must go through a Pull Request.**
4. **Only the `production` branch may be merged into `main`** — and only after the deployed production code has been confirmed working in live testing.
5. **There is no direct `staging` → `production` PR.** Staging may contain features that are ahead of what's been fully tested and approved for release — merging it wholesale into production would ship untested work. Production only ever receives specific, approved feature branches, merged in deliberately (see below).

## Branch Naming Convention

- `feat/<feature_name>`
- `i<number>/<feature_name>` — the `i` stands for "iteration," to make branches easier to search for.

## Branching Procedure

- New feature branches should branch out from `main`.
- A feature ready for testing should open a PR: `<feature_branch>` → `staging`.
- A feature ready for production follows the dedicated merge-branch procedure below — never a direct PR from the feature branch itself.

## Merging into Staging

All conflicts must be resolved locally, never directly through GitHub's UI.

**Example — resolving a conflict in `staging`:**

If `i1/feature1` has conflicting code with `staging`:

1. Pull the latest `staging` branch.
2. Create a merge branch based on `staging`, e.g. `i1/stage-merge`.
3. Merge `i1/feature1` into `i1/stage-merge` to surface the conflicts.
4. Resolve the conflicts locally.
5. Open the PR from `i1/stage-merge` → `staging` — **not** from `i1/feature1`.
6. **Do not** open a PR from this merge branch into `production`.

## Merging into Production

Every production deployment goes through a dedicated merge branch — **always**, whether or not a conflict is expected.

1. Pull the latest `production` branch.
2. Create a merge branch based on `production`, e.g. `i1/prod-merge`.
3. Merge the specific approved feature branch (e.g. `i1/feature1`) into `i1/prod-merge`.
4. Resolve any conflicts locally.
5. Open the PR from `i1/prod-merge` → `production`.

Once `production` is deployed and confirmed working in live testing:

6. Open a PR: `production` → `main`, to bring `main` up to date with what's actually live.

## Hotfix Procedure

For an urgent fix to production code:

1. Either branch a fix out from the relevant working branch (e.g. `i1/feature1`), or apply the fix directly on that branch.
2. Merge it into the production merge branch (`i1/prod-merge` → `production`), following the same procedure as above.
3. Once sanity-checked in production, open the `production` → `main` PR as usual — this ensures every hotfix is eventually reflected back in `main`.

## Revert Procedure

If a production deployment needs to be reverted:

1. Revert all changes within the relevant merge branch.
2. Open a PR of the reverted merge branch → `production`.
3. If that's not possible or something has gone seriously wrong, as a last resort: rename or delete the `production` branch, create a fresh `production` branch from `main`, and publish/deploy it from there.

## Notes

This project is deployed on-premise, which gives some leeway compared to a strict CI/CD pipeline — manual verification and judgment calls during merges/deploys are expected and acceptable.
