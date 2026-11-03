# ----------------------------------------------------------------------------
# Streamlit image: pharmacist-facing UI.
# Multipage app under dashboards/streamlit/, design system in lib/.
#
# NOTE: jusqu'au `RUN pip install` (inclus), ce Dockerfile est calqué à
# l'identique sur orchestration/Dockerfile (même FROM, même ENV, même WORKDIR,
# même paquets apt, même COPY/RUN). BuildKit compare alors les opérations
# contenu-adressées et le build streamlit RÉUTILISE le cache pip de l'image
# d'orchestration : les dépendances volumineuses (torch, prophet, dagster…)
# ne sont téléchargées qu'une seule fois pour les deux images.
# Ne modifier ces couches que par paires dans les deux Dockerfiles.
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
# MÊME commande qu'orchestration/Dockerfile (couches pip partagées BuildKit) :
# cache HTTP actif pendant les 3 relances réseau, retiré en fin de couche.
RUN unset PIP_NO_CACHE_DIR; \
    pip install --retries 10 --timeout 300 -r requirements.txt \
      || pip install --retries 10 --timeout 300 -r requirements.txt \
      || pip install --retries 10 --timeout 300 -r requirements.txt; \
    status=$$?; \
    rm -rf /root/.cache/pip; \
    exit $$status

# --- Divergence Streamlit (à partir d'ici, le cache n'est plus partagé) -----

COPY . .

# curl est utilisé par le docker-compose healthcheck ; les vars STREAMLIT_*
# pilotent l'UI headless.
ENV STREAMLIT_SERVER_HEADLESS=true \
    STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

# Exécution sans privilèges : l'UI n'a aucune raison de tourner root.
# HOME est posé explicitement pour que Streamlit écrive ses caches
# (~/.streamlit) dans un répertoire qui appartient à l'utilisateur.
RUN useradd --create-home --uid 1000 app \
    && chown -R app:app /app
USER app
ENV HOME=/home/app

EXPOSE 8501

# Streamlit runs the multipage entry point. The native theme lives at
# dashboards/streamlit/.streamlit/config.toml - Streamlit picks it up
# automatically because we cd into that directory at startup.
WORKDIR /app/dashboards/streamlit

CMD ["streamlit", "run", "app.py", \
     "--server.port=8501", "--server.address=0.0.0.0"]
