# Task 1 — Housing Price Prediction API

FastAPI + scikit-learn service that predicts housing prices from property features.

## Model
`StandardScaler → RidgeCV` (L2-regularized linear regression). Chosen because the dataset
is tiny (50 rows) with strong, highly collinear linear signal (all features correlate
~0.9–0.99). Ridge tames that multicollinearity and yields stable, interpretable
coefficients; a tree model would overfit and couldn't extrapolate or expose coefficients.
RidgeCV selects the regularization strength by cross-validation.

Metrics (cross-validated on 50 rows): **R² ≈ 0.985**, RMSE ≈ \$9.7k, MAE ≈ \$7.5k.

## Endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/predict` | Predict price for one or many properties (single = list of length 1). Returns price + RMSE confidence band + `out_of_range` flag. |
| `GET` | `/model-info` | Model type, features, intercept, standardized + raw coefficients, performance metrics. |
| `GET` | `/health` | Liveness + whether the model is loaded. |

Interactive docs: **`/docs`** (Swagger) and `/openapi.json`.

## Run locally
```bash
cd services/ml-api
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m training.train          # writes artifacts/model.pkl + metrics.json
uvicorn app.main:app --reload --port 8000
# open http://localhost:8000/docs
pytest                            # run the test suite
```

The API loads `artifacts/model.pkl` at startup; if it's missing it trains on the fly from
`data/house_price_dataset.csv` so the service never fails to boot.

## Run with Docker
Build from the **repo root** (the shared dataset lives there):
```bash
docker build -f services/ml-api/Dockerfile -t hsbc-ml-api .
docker run -p 8000:8000 hsbc-ml-api
```

## Example
```bash
curl -X POST http://localhost:8000/predict -H 'Content-Type: application/json' -d '{
  "items": [
    {"square_footage":1550,"bedrooms":3,"bathrooms":2,"year_built":1997,
     "lot_size":6800,"distance_to_city_center":4.1,"school_rating":7.6}
  ]
}'
```
