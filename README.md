# HSBC Housing Platform

A monorepo implementing the HSBC fullstack assignment: a containerised ML pricing API plus
a unified Next.js portal hosting two apps backed by **different** technologies (Python and
Java), both powered by the same model.

## Live demo (production on Render)

| What | URL |
|---|---|
| **Portal (main app)** | https://hsbc-portal.onrender.com |
| **ML API — Swagger UI** (Task 1) | https://ml-api-7y3b.onrender.com/docs |
| ML API — OpenAPI spec | https://ml-api-7y3b.onrender.com/openapi.json |
| ML API — health | https://ml-api-7y3b.onrender.com/health |

**Portal pages** (open in a browser):

| Page | App |
|---|---|
| `/estimate` · `/history` · `/compare` | App 1 — Property Value Estimator (Python) |
| `/dashboard` · `/whatif` · `/tables` | App 2 — Property Market Analysis (Java) |

**Portal API routes** (proxy to the private backends — testable via browser/curl):

| Route | Chain exercised |
|---|---|
| `GET  /api/model-info` | portal → Python BFF → ML API |
| `POST /api/estimate` | portal → Python BFF → ML API |
| `GET  /api/market/stats` | portal → Java backend |
| `GET  /api/market/segments?by=bedrooms` | portal → Java (`by` = `bedrooms`\|`price_band`\|`school_tier`) |
| `POST /api/market/whatif` | portal → Java → ML API |
| `GET  /api/market/export/csv` | portal → Java (CSV download) |

```bash
# example: single prediction through the deployed portal
curl -X POST https://hsbc-portal.onrender.com/api/estimate \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"square_footage":1800,"bedrooms":3,"bathrooms":2,"year_built":2001,"lot_size":7200,"distance_to_city_center":5,"school_rating":8}]}'
```

> `bff-property` and `market-analysis` are **private services** with no public URL — reach them
> only through the portal's `/api/*` routes above. The ML API is exposed publicly **only** so its
> Swagger is demoable; in a real deployment it would stay private.

## Architecture

```
                         ┌─────────────────────────────┐
   Browser ───────────►  │  Next.js portal (web, :3000) │  App Router · TS · Tailwind
                         └───────┬─────────────┬────────┘
                  route handlers │             │ route handlers / RSC
                                 ▼             ▼
                    ┌────────────────┐   ┌──────────────────────┐
        App 1  ───► │ Python BFF     │   │ Java Spring Boot      │ ◄─── App 2
                    │ (:8001)        │   │ market-analysis(:8080)│
                    └───────┬────────┘   └──────────┬───────────┘
                            │  /predict             │ /predict (what-if)
                            ▼                       ▼
                         ┌───────────────────────────────┐
                         │  ML API (FastAPI, :8000)      │  scikit-learn RidgeCV
                         └───────────────────────────────┘
```

- **App 1 — Property Value Estimator**: `web → Python BFF → ML API`.
- **App 2 — Property Market Analysis**: `web → Java backend → ML API`.
- The browser never calls the ML API directly; Next.js route handlers / RSC proxy to the
  backends, so internal service URLs stay server-side and there's no browser CORS.

| Service | Tech | Port | Folder |
|---|---|---|---|
| ML API | Python 3.12 · FastAPI · scikit-learn | 8000 | `services/ml-api` |
| Property BFF | Python 3.12 · FastAPI | 8001 | `services/bff-property` |
| Market Analysis | Java 21 · Spring Boot 3.4.4 | 8080 | `services/market-analysis` |
| Portal | Next.js 16 · TypeScript · Tailwind | 3000 | `web` |

## Run everything with Docker

```bash
docker compose up --build
# Portal:        http://localhost:3000
# ML API Swagger http://localhost:8000/docs
```

## Run services individually (no Docker)

```bash
# 1) ML API
cd services/ml-api && python3.12 -m venv .venv && source .venv/bin/activate \
  && pip install -r requirements.txt && python -m training.train \
  && uvicorn app.main:app --port 8000

# 2) Python BFF
cd services/bff-property && python3.12 -m venv .venv && source .venv/bin/activate \
  && pip install -r requirements.txt \
  && BFF_ML_API_URL=http://localhost:8000 uvicorn app.main:app --port 8001

# 3) Java backend  (needs JDK 21 + Maven)
cd services/market-analysis && export JAVA_HOME=$(/usr/libexec/java_home -v 21) \
  && ML_API_URL=http://localhost:8000 mvn spring-boot:run

# 4) Portal
cd web && npm install \
  && BFF_URL=http://localhost:8001 MARKET_API_URL=http://localhost:8080 npm run dev
```

## Tests

```bash
cd services/ml-api && pytest            # 5 tests
cd services/bff-property && pytest       # 3 tests
cd services/market-analysis && mvn test  # 3 tests
```

## Deploy (Render)

`render.yaml` is a production Blueprint of four services: the **public** Next.js portal, the
**public** ML API (exposed for live Swagger), and two **private** backends (`bff-property`,
`market-analysis`). Connect the repo as a Render Blueprint on `main`; dev stays local via
`docker compose`. Full setup, promotion, cost, and the internal-hostname gotcha are documented
in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## The model

`StandardScaler → RidgeCV` (L2-regularized linear regression). The dataset is tiny (50 rows)
and extremely collinear (all features correlate ~0.9–0.99), so Ridge gives stable,
interpretable coefficients where plain OLS does not. Cross-validated **R² ≈ 0.985**. See
`services/ml-api/README.md`.
