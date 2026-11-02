# CodeSpace

A showcase-ready Angular 22 freelance marketplace prototype for clients and independent professionals, inspired by platforms such as Upwork. The first release includes role-specific dashboards and profiles, job discovery and posting, proposal review, project tracking, and mock messaging.

## Run locally

```bash
npm install
npm start
```

Open the local URL printed by Angular CLI. Use the **Demo view** selector in the top bar to switch between the freelancer and client workspaces.

## Demo data

- Initial sample records live in [`public/mock-data.json`](./public/mock-data.json).
- The mock repository saves changes in browser `localStorage`, so posted jobs, proposals, hiring decisions, and messages survive a refresh.
- To restore the original sample, clear the `folk-marketplace-data-v1` item from the browser's local storage.
- The mock repository is for showcasing only; it does not provide authentication, authorization, or secure multi-user storage.

## Source layout

- `src/app/features/dashboard`, `jobs`, `proposals`, `messages`, and `profile` each contain their own standalone feature component and template.
- `src/app/features/workspace` contains the application shell and shared workspace state.
- `src/app/shared/models` contains shared domain types; `src/app/shared/data-access` contains the repository abstraction and mock implementation.
- `src/app/shared/styles` holds styles shared across features.

## Replacing the mock repository

The UI depends on the `MarketplaceRepository` abstraction, not on the mock implementation. The active implementation is selected in [`src/app/app.config.ts`](./src/app/app.config.ts):

```ts
{ provide: MarketplaceRepository, useClass: MockMarketplaceRepository }
```

Implement the same repository methods using Angular `HttpClient`, then replace that provider with the API repository. This keeps the mock implementation useful for local development and static showcases while the production implementation uses real API endpoints. The demo role selector should be replaced with the authenticated user's role when authentication is introduced.

## Build and static hosting

```bash
npm run build
```

The app uses a relative base URL and resolves the mock JSON from the deployed site, so it can be served from a repository subpath such as GitHub Pages. If your deployment needs an explicit base path, build with `ng build --base-href /<repository-name>/`.

## Tests

```bash
npm test
```
