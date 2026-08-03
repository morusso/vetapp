FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY backend/ .

RUN pip install --no-cache-dir -r requirements/requirements.txt

COPY deployment/docker/dev_files/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
