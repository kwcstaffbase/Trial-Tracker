# Deploy to Vercel

End-to-end runbook to get this app live at a public Vercel URL with hourly
data refreshes from SharePoint. Estimated time: 20–30 minutes the first time.

## Architecture (so you know what we're building)

```
                 hourly cron (GitHub Actions)
                          │
                          ▼
              ┌──────────────────────────┐
              │ Vercel Deploy Hook (URL) │
              └──────────────────────────┘
                          │ triggers
                          ▼
              ┌──────────────────────────┐
              │   Vercel build runs:     │
              │  1. npm run prebuild     │  ← scripts/fetch-data.mjs
              │     (fetch SharePoint)   │     downloads .xlsx, writes
              │  2. npm run build        │     to public/data.xlsx
              │     (Vite build)         │
              └──────────────────────────┘
                          │
                          ▼
              ┌──────────────────────────┐
              │ Vercel CDN serves:       │
              │  /            → SPA      │
              │  /data.xlsx   → bundled  │
              └──────────────────────────┘
                          │
                          ▼
                    user's browser
```

Data freshness: as fresh as the last successful deploy. With the hourly cron,
data is at most ~1 hour stale.

## Prerequisites

- A GitHub account
- A Vercel account (sign up free at https://vercel.com using the GitHub login)
- `git` installed locally (`git --version`)

## One-time setup

### 1. Initialize git in the project

```bash
cd "<path to trial-tracker>"
git init
git add .
git commit -m "Initial commit: trial tracker"
```

### 2. Create a GitHub repo and push

Go to https://github.com/new → name it (e.g. `trial-tracker`) → keep it
**Private** (clinical data, even if anonymous) → don't add a README, .gitignore,
or license (we already have them).

Then in your terminal, follow the "push an existing repository" instructions
GitHub shows. Roughly:

```bash
git remote add origin git@github.com:<your-username>/trial-tracker.git
git branch -M main
git push -u origin main
```

### 3. Import the project into Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository", pick the repo you just created
3. Vercel will auto-detect Vite. Confirm:
   - Framework: **Vite**
   - Build command: `npm run build` (already in vercel.json)
   - Output directory: `dist`
4. Expand "Environment Variables" and add:
   - **Name:** `SHAREPOINT_SHARE_URL`
   - **Value:** the SharePoint share URL (the one currently hardcoded in
     vite.config.js — paste it here so it's editable later without a code push)
5. Click **Deploy**.

The first build will run `npm run prebuild` (the fetch script), then
`npm run build`. Watch the build log — you'll see lines like:

```
[fetch-data] trying "graph-shares-content" → ...
[fetch-data] ✓ wrote 12.13 MB via "graph-shares-content"
```

If all three strategies fail, the build fails with a list of errors. The
previous (working) deployment stays live, so you can't break production with
a bad SharePoint state.

After ~1 minute the deploy goes live. Vercel gives you a URL like
`trial-tracker-xyz123.vercel.app`. Open it — it should load without an
upload screen, showing the disease grid.

### 4. Set up the hourly refresh cron

#### 4a. Create a Vercel Deploy Hook

1. In Vercel: project → **Settings** → **Git** → **Deploy Hooks**
2. Click **Create Hook**
3. Name: `refresh-data`, Branch: `main`
4. Click **Create**
5. Copy the URL it gives you. Looks like
   `https://api.vercel.com/v1/integrations/deploy/prj_XXX/YYY`. Treat this URL
   as a secret — anyone with it can trigger a redeploy.

#### 4b. Add the hook URL to GitHub Secrets

1. In your GitHub repo: **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VERCEL_DEPLOY_HOOK`
4. Secret: paste the URL from step 4a
5. Click **Add secret**

#### 4c. Test the cron

The workflow file `.github/workflows/refresh-data.yml` is already in the repo
(it was committed in step 1). It runs hourly automatically, but you can
trigger it manually to verify it works:

1. In GitHub: **Actions** tab → **Refresh data hourly** → **Run workflow** →
   pick `main` → **Run workflow**
2. Within ~30 seconds the workflow run shows green
3. Within ~1 minute, Vercel will show a new deployment in the Deployments tab
4. Within ~2 minutes total, the new deployment is live with fresh data

After this, the workflow runs every hour on the hour (UTC) without intervention.

## Verifying the data is actually refreshing

To confirm the cron is working day-to-day:

- Edit something in the SharePoint spreadsheet
- Wait an hour, refresh the deployed site, confirm the change shows up
- Or trigger the workflow manually after editing for a faster check

## Updating the SharePoint URL later

If Paul rotates the share link:

1. In Vercel: project → **Settings** → **Environment Variables**
2. Edit `SHAREPOINT_SHARE_URL` with the new URL
3. Trigger a redeploy (Deployments tab → latest → "Redeploy"). The next deploy
   uses the new URL.

No code change required.

## Costs

Everything in this setup fits the free tier:

- Vercel Hobby: free, includes 100 GB bandwidth/mo
- GitHub Actions: 2,000 minutes/mo free for private repos (this cron uses ~5
  seconds per run × 24 runs/day = 60 minutes/mo — well under the limit)

If you outgrow the free tier (likely only if the trial tracker gets a lot of
public traffic), you'd need Vercel Pro at $20/mo.

## Things to know / gotchas

1. **Public URL.** Anyone with the URL can browse the data. Search engines
   *will* index it. To block this minimally, add a `public/robots.txt`:
   ```
   User-agent: *
   Disallow: /
   ```
   (This only stops well-behaved crawlers — it isn't security. For real
   protection, add an auth gate.)

2. **Build failures.** If a SharePoint hiccup causes the build to fail, the
   previous deploy stays live and you'll get a Vercel email. Manually
   re-trigger the deploy hook once SharePoint is healthy.

3. **GitHub Actions cron drift.** Free-tier cron isn't guaranteed to run on
   the minute — runs may be delayed by minutes during GitHub's busy hours.
   For "approximately hourly" this is fine.

4. **Data is downloaded at build time.** If you push a code change, that
   deploy *also* fetches fresh data as a side effect. Not a bug — just so
   you know.

5. **Removing the public default URL.** The fallback SharePoint URL is
   hardcoded in `vite.config.js` and `scripts/fetch-data.mjs` so a fresh
   clone works without configuration. If you later want to require the env
   var to be set, replace the fallback `||  '...'` with `|| (() => { throw
   new Error('SHAREPOINT_SHARE_URL not set') })()`.
