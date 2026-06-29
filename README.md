# HSBC Housing Platform

Monorepo for the HSBC fullstack assignment.

- **Task 1** — Housing Price Prediction API (Python 3.12 / FastAPI / scikit-learn) → `services/ml-api`
- **Task 2** — Unified Next.js portal with two apps:
  - **App 1** Property Value Estimator — Python/FastAPI backend → `services/bff-property`
  - **App 2** Property Market Analysis — Java 21 / Spring Boot 3.4.4 backend → `services/market-analysis`
  - Frontend → `web`

See `docs/` for the original spec. Dataset lives in `data/house_price_dataset.csv`.

## Layout
```
data/                 canonical dataset + test data
services/ml-api/      Task 1 — FastAPI + sklearn        (port 8000)
services/bff-property/ App 1 backend — FastAPI proxy    (port 8001)
services/market-analysis/ App 2 backend — Spring Boot   (port 8080)
web/                  Next.js portal                    (port 3000)
docker-compose.yml    local orchestration of all 4 services
render.yaml           Render.com deployment blueprint
```
