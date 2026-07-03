# Deployment Runbook

How this app is deployed across **three environments** for the client demo.

| Env | Where | Branch | URL |
|---|---|---|---|
| **dev** | Local machine (`docker compose`) | any / working tree | http://localhost:3000 |
| **test / staging** | Render (cloud) | `staging` | https://hsbc-portal-staging.onrender.com |
| **prod** | Render (cloud) | `main` | https://hsbc-portal.onrender.com |

Both cloud environments are defined in a **single** `render.yaml` Blueprint. Prod services
track `main`; staging services track `staging`. The two stacks are fully isolated (separate
services, URLs, and CORS) — a push to one never touches the other.

```
                 push to main ─────────────► PROD stack   (hsbc-portal + 3 private backends)
GitHub repo  ◄─ Render Blueprint watches ─┤
                 push to staging ─────────► STAGING stack (…-staging ×4)
```

---

## 1. dev — local (no cloud, no cost)

```bash
docker compose up --build
# Portal:        http://localhost:3000
# ML API Swagger http://localhost:8000/docs
```

This is your day-to-day environment. Nothing to deploy.

---

## 2. One-time setup for the cloud environments

### 2a. Create the `staging` branch and push both branches

```bash
# from repo root, with everything committed on main
git checkout -b staging
git push -u origin staging
git checkout main
git push origin main            # ensure main (with render.yaml) is up to date
```

> The Blueprint reads `render.yaml` from `main`, but the staging **services** build from the
> `staging` branch. Both branches must exist on GitHub before you create the Blueprint.

### 2b. Create the Render Blueprint

1. Sign in at <https://dashboard.render.com> (GitHub sign-in is easiest).
2. **New → Blueprint**.
3. Connect the repo `wazid371d/hsbc-fullstack-assignment`, branch **`main`**.
4. Render reads `render.yaml` and lists **8 services** (4 prod + 4 staging). Click **Apply**.
5. First build takes several minutes (Java/Maven + Next.js + pip). Watch the logs per service.

### 2c. Confirm the public URLs

Render assigns URLs from the service names. If your account already uses `hsbc-portal`,
Render appends a suffix — in that case update the CORS values in `render.yaml` (see §4) to the
**actual** portal URLs and re-apply, or the browser→backend calls will be CORS-blocked.

- Prod portal → `https://hsbc-portal.onrender.com`
- Staging portal → `https://hsbc-portal-staging.onrender.com`

---

## 3. Day-to-day flow (promotion: dev → staging → prod)

```bash
# 1. build & verify locally (dev)
docker compose up --build

# 2. promote to staging for QA / client preview
git checkout staging && git merge main && git push      # → auto-deploys STAGING

# 3. once approved, promote to prod (the demo URL)
git checkout main && git merge staging && git push       # → auto-deploys PROD
```

Every push to `staging` or `main` triggers an automatic redeploy of only that env's services.
Rollback: in the Render dashboard, open a service → **Deploys** → **Rollback** to a prior build.

---

## 4. If you must change the public URLs

The internal service-to-service URLs (`http://ml-api:8000`, etc.) never change. Only the
**public portal URLs** appear in CORS config. If Render assigns different hostnames, update
these keys in `render.yaml` and re-apply the Blueprint:

| Service | Key | Set to |
|---|---|---|
| `bff-property` | `BFF_CORS_ORIGINS` | `["<prod portal url>"]` |
| `market-analysis` | `CORS_ALLOWED_ORIGINS` | `<prod portal url>` |
| `bff-property-staging` | `BFF_CORS_ORIGINS` | `["<staging portal url>"]` |
| `market-analysis-staging` | `CORS_ALLOWED_ORIGINS` | `<staging portal url>` |

---

## 5. Cost & the free-tier trade-off

This Blueprint uses **`plan: starter`** (~$7/service/month) for all 8 services because Render's
**private services (`pserv`) are not available on the free tier**, and starter instances stay
**always-on** — no cold starts, which matters when demoing live.

Rough cost: 8 × ~$7 ≈ **~$56/month** while both envs run.

Ways to cut cost:
- **Run only prod in the cloud**, keep staging local. Delete the 4 `*-staging` services from
  `render.yaml` → ~$28/month.
- **Free tier for the demo**: change the three backends per env from `type: pserv` to
  `type: web` and drop `plan: starter` (Render free web services). Caveat: free services
  **spin down when idle** (~30–50 s cold start on first hit — do a warm-up request right before
  the demo) and the backends become publicly reachable (fine for a throwaway demo, not for real
  prod).
- **Suspend** an environment between demos from the Render dashboard to stop billing.

---

## 6. Pre-demo checklist

- [ ] `main` and `staging` both pushed to GitHub, Blueprint **Applied**, all 8 services green.
- [ ] Open the prod portal URL and click through: estimate → history → compare, dashboard →
      what-if → tables (CSV + PDF export).
- [ ] If on free tier, hit each portal once ~1 min before the demo to warm the backends.
- [ ] ML API Swagger reachable (internal — reach it via the portal, or temporarily expose
      `ml-api` as a `web` service if you want to show `/docs` live).
- [ ] Have `docker compose up` ready locally as a fallback if the network/cloud misbehaves.
