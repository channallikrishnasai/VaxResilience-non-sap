# ----------------------------------------------------------------------------
# Image commune : Dagster (webserver + daemon), simulateur, consumer, db-init,
# indexeur RAG. Exécution sans privilèges : tout tourne sous l'utilisateur
# applicatif `app` (uid 1000), jamais root.
#
# Note migration : si un volume dagster-home a été créé par une ancienne image
# (propriété root), le recréer une fois : `docker compose down` puis
# `docker volume rm vigistock_dagster-home` (ou `make nuke`).
#
# NOTE : jusqu'au `RUN pip install` (inclus), les couches de ce Dockerfile
# sont calquées à l'identique sur dashboards/streamlit/Dockerfile pour que
# BuildKit partage le cache pip entre les deux images (les gros paquets
# ne sont téléchargés qu'une seule fois). Modifier ces couches par paires.
# ----------------------------------------------------------------------------
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
# pip avec réseau capricieux (CDN pytorch/pypi) :
# - PIP_NO_CACHE_DIR désactivé via unset → le cache HTTP survit aux relances,
#   une roue déjà téléchargée n'est pas re-téléchargée à la 2e tentative ;
# - 3 tentatives, puis retrait du cache (même couche → pas de gonflement) ;
# - --retries/--timeout : lectures lentes (15 s par défaut) = échec build.
# Couches calquées à l'identique sur dashboards/streamlit/Dockerfile.
RUN unset PIP_NO_CACHE_DIR; \
    pip install --retries 10 --timeout 300 -r requirements.txt \
      || pip install --retries 10 --timeout 300 -r requirements.txt \
      || pip install --retries 10 --timeout 300 -r requirements.txt; \
    status=$$?; \
    rm -rf /root/.cache/pip; \
    exit $$status

COPY . .

ENV DAGSTER_HOME=/opt/dagster/dagster_home

# Utilisateur non privilégié : possède le code et le DAGSTER_HOME, de sorte
# que le volume nommé hérite de la bonne propriété à sa création.
RUN useradd --create-home --uid 1000 app \
    && mkdir -p ${DAGSTER_HOME} \
    && chown -R app:app /app /opt/dagster
USER app
ENV HOME=/home/app

EXPOSE 3000
