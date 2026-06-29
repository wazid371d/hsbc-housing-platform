# App 1 Backend — Property Value Estimator BFF

FastAPI backend-for-frontend for the Property Value Estimator. Validates property form
submissions, forwards them to the Task 1 ML API, and translates upstream errors. The
browser never calls the ML API directly — it goes through this BFF (or Next.js route
handlers that proxy here).

## Endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/estimate` | Validate + predict one or many properties (single = list of length 1). |
| `GET` | `/api/model-info` | Pass-through of the ML model coefficients/metrics. |
| `GET` | `/health` | Reports own status and whether the ML API is reachable. |

Swagger at `/docs`.

## Config (env vars, prefix `BFF_`)
| Var | Default | Purpose |
|---|---|---|
| `BFF_ML_API_URL` | `http://localhost:8000` | Base URL of the Task 1 ML API. |
| `BFF_ML_API_TIMEOUT_SECONDS` | `10` | Upstream request timeout. |
| `BFF_CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed browser origins. |

## Run locally
```bash
cd services/bff-property
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
BFF_ML_API_URL=http://localhost:8000 uvicorn app.main:app --reload --port 8001
pytest        # ML client stubbed; no live ML API required
```

## Docker
```bash
docker build -t hsbc-bff-property services/bff-property
docker run -p 8001:8000 -e BFF_ML_API_URL=http://host.docker.internal:8000 hsbc-bff-property
```
