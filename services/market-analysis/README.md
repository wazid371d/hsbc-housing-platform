# App 2 Backend — Property Market Analysis (Java / Spring Boot)

Spring Boot 3.4.4 / Java 21 service that powers the Market Analysis app: aggregate
statistics, segment breakdowns, a what-if tool (calling the Task 1 ML API), and CSV export.
Aggregates are cached with Caffeine.

## Endpoints
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/market/stats` | Aggregate market summary (avg/median/min/max price, price-per-sqft). Cached. |
| `GET` | `/api/market/segments?by=bedrooms` | Per-segment stats. `by` = `bedrooms` \| `price_band` \| `school_tier`. Cached. |
| `GET` | `/api/market/properties?bedrooms=&minPrice=&maxPrice=&sort=&order=` | Filtered + sorted rows for tables. |
| `POST` | `/api/market/whatif` | Forwards features to the ML API and compares the prediction to the segment average. |
| `GET` | `/api/market/export/csv` | CSV download of (optionally filtered) properties. |
| `GET` | `/api/market/health` | Simple health check (also `/actuator/health`). |

## How it works
- `CsvPropertyRepository` loads `classpath:data/house_price_dataset.csv` once at startup
  into an in-memory list (data is small and static). The dataset is a build-time copy of
  the canonical `data/house_price_dataset.csv` at the repo root — keep them in sync.
- `StatsService` computes aggregates, annotated `@Cacheable` (Caffeine, 10-min TTL).
- `MlClientService` calls the ML API with Spring `RestClient`; what-if results are cached
  by feature vector.

## Config (env vars)
| Var | Default | Purpose |
|---|---|---|
| `ML_API_URL` | `http://localhost:8000` | Base URL of the Task 1 ML API. |
| `DATASET_PATH` | `classpath:data/house_price_dataset.csv` | Dataset location. |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Allowed browser origins. |

## Run locally
```bash
cd services/market-analysis
export JAVA_HOME=$(/usr/libexec/java_home -v 21)   # or the brew openjdk@21 home
ML_API_URL=http://localhost:8000 mvn spring-boot:run
mvn test
```

## Docker
```bash
docker build -t hsbc-market-analysis services/market-analysis
docker run -p 8080:8080 -e ML_API_URL=http://host.docker.internal:8000 hsbc-market-analysis
```
