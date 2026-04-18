# GitHub Pages — Dual-content deployment guide

**Goal**: serve the **existing HTML** at `/ai-banking-report/` (unchanged) AND the **Clarity React view** at `/ai-banking-report/clarity/`, both from the same repo.

## One-time setup (user manual step)

### 1. Build the Clarity React view

```bash
cd ~/code/active/ai-banking-report
git checkout clarity-react-view
npm install                 # installs @clarity-ds/core via file: symlink
npm run build               # generates dist/ with base="/ai-banking-report/clarity/"
```

### 2. Create the gh-pages branch with dual content

```bash
# Return to main temporarily to pull the old HTML snapshot
git worktree add -B gh-pages gh-pages-tmp main

# Clean the worktree
cd gh-pages-tmp
git rm -rf .

# Mirror the old HTML at root (keeps /ai-banking-report/ URL)
git show main:index.html > index.html
git show main:ai_banking_landscape_jp.html > ai_banking_landscape_jp.html

# Place the Clarity multi-entry React build under /clarity/.
# Vite builds dist/index.html (banking) + dist/process-catalog/index.html (S2 POC)
# and assets at dist/assets/. Copying dist/ as-is gives:
#   /clarity/index.html                    (banking page)
#   /clarity/process-catalog/index.html    (S2 POC page)
#   /clarity/assets/...                    (shared bundle)
mkdir -p clarity
cp -R ../dist/. clarity/

# Commit
git add .
git commit -m "chore(pages): triple content — old HTML root + Clarity banking /clarity/ + Clarity S2 POC /clarity/process-catalog/"
git push -u origin gh-pages

# Cleanup
cd ..
git worktree remove gh-pages-tmp
```

### 3. Switch GitHub Pages source (one-time)

1. Navigate to `https://github.com/ShinjiF1002/ai-banking-report/settings/pages`
2. Under **Source**, select **Deploy from a branch**
3. Set **Branch** to `gh-pages` and **Folder** to `/ (root)`
4. Save

Allow 1-2 minutes for GitHub Pages to rebuild.

**Resulting URLs**:
- `https://shinjif1002.github.io/ai-banking-report/` → old HTML (unchanged visual)
- `https://shinjif1002.github.io/ai-banking-report/clarity/` → Clarity S1 banking React view
- `https://shinjif1002.github.io/ai-banking-report/clarity/process-catalog/` → Clarity S2 BackofficeAI Process Catalog POC

## Update flow (re-deploy Clarity view)

```bash
cd ~/code/active/ai-banking-report
git checkout clarity-react-view
# (make changes in clarity-app/)
npm run build

# Push updated Clarity build to gh-pages /clarity/
git worktree add gh-pages-tmp gh-pages
cd gh-pages-tmp
rm -rf clarity
cp -R ../dist/. clarity/
# Note: if main's old HTML was also updated, re-mirror it:
#   git show main:index.html > index.html
git add .
git commit -m "chore(pages): refresh Clarity view"
git push
cd ..
git worktree remove gh-pages-tmp
```

## Rollback

If the Clarity view is broken and must be removed:

```bash
git worktree add gh-pages-tmp gh-pages
cd gh-pages-tmp
rm -rf clarity
git add .
git commit -m "chore(pages): temporarily remove Clarity view"
git push
cd ..
git worktree remove gh-pages-tmp
```

Or to fully revert to original publish mechanism:

1. Back in GitHub Settings → Pages, change Source branch back to `main` root
2. Old `index.html` at main root keeps serving, Clarity URL returns 404

## Not done here (deferred per Subtract)

- **GitHub Actions automation** (`.github/workflows/deploy.yml`): manual deploy for S1, automation deferred to S3+ per meta-overinvestment abstention
- **Custom domain / HTTPS config**: not changed from repo defaults
- **Cache headers / CDN tuning**: GitHub Pages defaults only
- **Analytics / monitoring**: not configured

## Clarity dependency path caveat

`package.json` uses `"@clarity-ds/core": "file:../../.claude/worktrees/wonderful-poitras-0813d9/active/clarity"`. This path is **brittle** — it assumes Clarity lives at the specific worktree path in a Claude Code session.

When Clarity is merged to main and lives at `/Users/.../code/active/clarity/`, update to:

```json
"@clarity-ds/core": "file:../clarity"
```

Or publish `@clarity-ds/core` to npm and install normally.

## Verification after deploy

```bash
curl -s -o /dev/null -w "Old HTML: %{http_code}\n" https://shinjif1002.github.io/ai-banking-report/
curl -s -o /dev/null -w "Clarity: %{http_code}\n" https://shinjif1002.github.io/ai-banking-report/clarity/
```

Both should return `200`. LinkedIn Post Inspector (https://www.linkedin.com/post-inspector/) can confirm meta tags on each URL.
