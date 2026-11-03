# Vigistock — Local Setup (Windows 11 + Docker Desktop)

Stack complète en local : Redpanda (Kafka), TimescaleDB, Silo/MinIO (S3),
Grafana, Dagster, simulateur IoT, consumer streaming, Streamlit, ChromaDB,
Ollama. Toutes les images tournent en **CPU-only** (aucun paquet CUDA/NVIDIA).

## Prérequis

- Windows 11 + Docker Desktop (WSL2 backend), ≥ 16 Go de RAM conseillés
- Git (optionnel)
- Aucun GPU requis

## Démarrage (PowerShell)

```powershell
cd C:\Users\chann\vigistock

# 1. Fichier d'environnement (aucun secret requis pour la démo)
if (-not (Test-Path .env)) { Copy-Item .env.example .env }

# 2. Construire les images Python (torch CPU déjà inclus via requirements.txt)
docker compose build

# 3. Monter toute la stack
docker compose up -d

# 4. Suivre le démarrage (db-init -> indexer -> pipeline)
docker compose logs -f --tail=100
# Ctrl+C pour arrêter le follow (la stack continue de tourner)
```

Premier démarrage : Ollama télécharge `phi3:mini` (~2,4 Go) via
`ollama-bootstrap`, et `llm-indexer` indexe les protocoles dans ChromaDB.
Comptez 5 à 15 minutes selon votre connexion.

## Vérifier que tout est UP

```powershell
docker compose ps
```

Les services `db-init`, `ollama-bootstrap` et `llm-indexer` sont one-shot :
état `exited (0)` = succès.

```powershell
# Santé des services
curl.exe -fsS http://localhost:8501/_stcore/health          # Streamlit -> "ok"
curl.exe -fsS http://localhost:9000/minio/health/live        # S3 (Silo) -> 200
curl.exe -fsS http://localhost:3000/api/health               # Grafana -> {"database":"ok"}
curl.exe -s http://localhost:3001/info                       # Dagster webserver

# Données live dans TimescaleDB (via le container)
docker exec vigistock-timescale psql -U vigistock -d vigistock -c "SELECT count(*) FROM silver.telemetry_raw;"
docker exec vigistock-timescale psql -U vigistock -d vigistock -c "SELECT count(*) FROM silver.alerts;"

# Le pipeline produit des données ? (consumer + simulateur)
docker logs vigistock-streaming-consumer --tail 20
docker logs vigistock-simulator --tail 20

# Test S3 (crée un bucket éphémère, met/récupère un objet)
docker compose run --rm db-init python scripts/s3_smoke_test.py
```

## URLs

| Service        | URL                              | Accès            |
|----------------|----------------------------------|------------------|
| Streamlit      | http://localhost:8501            | —                |
| Grafana        | http://localhost:3000            | admin / admin    |
| Dagster        | http://localhost:3001            | —                |
| Silo console   | http://localhost:9001            | minioadmin / minioadmin |
| S3 API         | http://localhost:9000            | minioadmin / minioadmin |
| Ollama         | http://localhost:11434           | —                |
| ChromaDB       | http://localhost:8000            | —                |
| Redpanda       | localhost:9092                   | —                |
| TimescaleDB    | localhost:5432                   | vigistock / change-me |

## Commandes du jour courant

```powershell
docker compose logs -f --tail=100      # logs
docker compose ps                      # état
docker compose restart streamlit       # redémarrer un service
docker compose down                    # stopper (les volumes sont conservés)
docker compose up -d                   # redémarrer
docker compose down -v                 # ATTENTION : supprime les volumes
docker compose build --no-cache        # rebuild complet
```

## Tests

```powershell
# Unit tests (sans stack) — vérifié : 37 passed
docker compose run --rm --no-deps db-init bash -c "pip install -q --retries 10 pytest==8.3.4 pytest-asyncio==0.24.0 && python -m pytest tests/unit -q"

# Integration tests (testcontainers : socket Docker monté dans le conteneur) — vérifié
docker compose run --rm --no-deps --user root `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -e DOCKER_HOST=unix:///var/run/docker.sock `
  -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal `
  db-init bash -c "pip install -q --retries 10 pytest==8.3.4 pytest-asyncio==0.24.0 'testcontainers[postgres]==4.8.2' && python -m pytest tests/integration -q -m integration"
```

## Optimisation des dépendances

- `requirements.txt` pinnne `torch==2.5.1+cpu` avec
  `--extra-index-url https://download.pytorch.org/whl/cpu` : pas de wheels
  CUDA (~2,5 Go évités) sur machine sans GPU.
- Pins de résolution (backtracking éliminé) : `cmdstanpy==1.2.5` (Prophet 1.1.6
  exige le cmdstan bundled dans son wheel), `aiobotocore==2.17.0` +
  `botocore==1.35.93` (conflit s3fs↔boto3), `transformers==4.46.3`
  (conflit sentence-transformers↔huggingface-hub).
- `COPY requirements.txt` précède `COPY . .` dans les deux Dockerfiles :
  la couche pip est cachée tant que les dépendances ne changent pas.
- Les couches de dépendances des deux Dockerfiles (orchestration +
  streamlit) sont **calquées à l'identique** (même FROM/ENV/apt/COPY/RUN) :
  BuildKit partage le cache pip → les ~700 Mo de dépendances ne sont
  téléchargés qu'une seule fois (9/10 couches partagées vérifiées).
- Une seule image Python (`orchestration/Dockerfile`) est partagée par
  6 services (db-init, dagster, dagster-daemon, simulator,
  streaming-consumer, llm-indexer) : build unique, réutilisé.

## Dépannage

| Symptôme | Action |
|----------|--------|
| `db-init` en échec | `docker compose logs db-init` (il rejoue le DDL, idempotent) |
| Streamlit sur le mock | Vérifier `docker compose ps` : db-init et consumer doivent avoir réussi |
| Port déjà occupé | Modifier le membre gauche des `ports:` dans `docker-compose.yml` |
| Volume propriétaire root (ancienne image) | `docker compose down` puis `docker volume rm vigistock_dagster-home` |
| Tout refaire à zéro | `docker compose down -v` puis relancer l'étape 3 |
