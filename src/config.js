// =============================================================================
//  Data source URL
// -----------------------------------------------------------------------------
//  In dev (`npm run dev`): the URL points to the Vite middleware in
//  vite.config.js, which fetches SharePoint server-side via multiple strategies.
//
//  In prod (`npm run build` / Vercel): the URL points to a static asset that
//  was downloaded and bundled by `scripts/fetch-data.mjs` during `npm run build`
//  (the `prebuild` lifecycle script in package.json). The data is therefore as
//  fresh as the last deploy. The GitHub Actions cron in
//  .github/workflows/refresh-data.yml triggers a redeploy hourly.
// =============================================================================

export const DATA_SOURCE_URL = import.meta.env.DEV ? '/sharepoint-data' : '/data.xlsx'
