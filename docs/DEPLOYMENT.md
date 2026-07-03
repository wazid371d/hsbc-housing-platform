# Deployment Runbook

How this app is deployed for the client demo.

| Env | Where | Branch | URL |
|---|---|---|---|
| **dev** | Local machine (`docker compose`) | any / working tree | http://localhost:3000 |
| **prod** | Render (cloud) | `main` | https://hsbc-portal-iy97.onrender.com |

Production is defined in `render.yaml` as a single Render **Blueprint**: four Docker services
tracking the `main` branch — two **public** (the Next.js portal and the ML API, the latter
exposed for live Swagger) and two **private** (`bff-property`, `market-analysis`).

```
                 push to main ─────────────► PROD stack
GitHub repo  ◄─ Render Blueprint watches ─┤   (hsbc-portal + ml-api + bff-property + market-analysis)
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

## 2. One-time setup — create the Render Blueprint

1. Sign in at <https://dashboard.render.com> (GitHub sign-in is easiest).
2. Go to **Blueprints** → **New Blueprint Instance** (or **New → Blueprint**).
3. Connect the repo `wazid371d/hsbc-fullstack-assignment`, branch **`main`**.
4. Render reads `render.yaml` and lists **4 services**. Click **Apply**.
5. First build takes several minutes (Java/Maven + Next.js + pip). Watch the logs per service.

### Confirm the public URL

Render assigns the URL from the service name. If your account already uses `hsbc-portal`,
Render appends a suffix — in that case update the CORS values in `render.yaml` (see §4) to the
**actual** portal URL and re-apply, or the browser→backend calls will be CORS-blocked.

- Prod portal → `https://hsbc-portal-iy97.onrender.com`

---

## 3. Day-to-day flow (dev → prod)

```bash
# 1. build & verify locally (dev)
docker compose up --build

# 2. ship to prod (the demo URL)
git checkout main && git push        # → auto-deploys PROD
```

Every push to `main` triggers an automatic redeploy of the production services.
Rollback: in the Render dashboard, open a service → **Deploys** → **Rollback** to a prior build.

---

## 4. If you must change the public URL

The internal service-to-service URLs (`http://ml-api:8000`, etc.) never change. Only the
**public portal URL** appears in CORS config. If Render assigns a different hostname, update
these keys in `render.yaml` and re-apply the Blueprint:

| Service | Key | Set to |
|---|---|---|
| `bff-property` | `BFF_CORS_ORIGINS` | `["<prod portal url>"]` |
| `market-analysis` | `CORS_ALLOWED_ORIGINS` | `<prod portal url>` |

---

## 5. Cost

This Blueprint uses **`plan: starter`** (~$7/service/month) for all 4 services because Render's
**private services (`pserv`) are not available on the free tier**, and starter instances stay
**always-on** — no cold starts, which matters when demoing live.

Rough cost: 4 × ~$7 ≈ **~$28/month** while prod runs.

Ways to cut cost:
- **Free tier for the demo**: change the three backends from `type: pserv` to `type: web` and
  drop `plan: starter` (Render free web services). Caveat: free services **spin down when idle**
  (~30–50 s cold start on first hit — do a warm-up request right before the demo) and the
  backends become publicly reachable (fine for a throwaway demo, not for real prod).
- **Suspend** the environment between demos from the Render dashboard to stop billing.

---

## 6. Pre-demo checklist

- [ ] `main` pushed to GitHub, Blueprint **Applied**, all 4 services green.
- [ ] Open the prod portal URL and click through: estimate → history → compare, dashboard →
      what-if → tables (CSV + PDF export).
- [ ] ML API Swagger reachable at the public ML API URL + `/docs`
      (e.g. https://ml-api-iy97.onrender.com/docs).
- [ ] If on free tier, hit the portal once ~1 min before the demo to warm the backends.
- [ ] Have `docker compose up` ready locally as a fallback if the network/cloud misbehaves.
