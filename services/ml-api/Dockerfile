# Build context is the REPO ROOT so the shared dataset can be copied in.
#   docker build -f services/ml-api/Dockerfile -t hsbc-ml-api .
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Install dependencies first for better layer caching.
COPY services/ml-api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Application code, the pre-trained artifact, and the dataset (fallback trainer).
COPY services/ml-api/app ./app
COPY services/ml-api/artifacts ./artifacts
COPY data ./data

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
