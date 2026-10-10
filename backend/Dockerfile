# Backend Dockerfile for CardioVision 3D (CVS-3D)
FROM python:3.11-slim AS builder

WORKDIR /app

# Install security updates & build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final production stage (non-root execution for clinical hardening)
FROM python:3.11-slim

WORKDIR /app

# Create non-root medical service user
RUN addgroup --system --gid 10001 cardiovision && \
    adduser --system --uid 10001 --gid 10001 cardiovision

COPY --from=builder /root/.local /home/cardiovision/.local
COPY --chown=cardiovision:cardiovision . .

ENV PATH=/home/cardiovision/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

USER cardiovision

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request, ssl; ctx = ssl._create_unverified_context(); urllib.request.urlopen('https://localhost:8000/api/v1/health', context=ctx)" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--ssl-keyfile", "ssl/key.pem", "--ssl-certfile", "ssl/cert.pem"]
