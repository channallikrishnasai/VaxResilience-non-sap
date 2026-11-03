"""Pipeline architecture: the page where the technical vocabulary lives.

UX intent
---------
This is the place where the engineering pride is expressed (Redpanda,
TimescaleDB, Prophet, Dagster, ChromaDB, hypertables...). The jargon is
legitimate here, and it does not spill over onto the clinical pages.

Layout:
* A pipeline diagram organized left-to-right (flow direction), six stages:
  Sense, Stream, Store, Forecast, Reason, Act.
* Tabs for deep dives on each stage.
* A cloud mapping table: the managed equivalent of each OSS choice.
"""
from __future__ import annotations

import streamlit as st
from lib import components as C
from lib import icons as I

# ---------------------------------------------------------------------------
# Page header (ambient tone: Pipeline & data section)
# ---------------------------------------------------------------------------
C.page_header(
    eyebrow="Pipeline & data",
    icon="pipeline",
    tone="secondary",
    title="Pipeline architecture",
    subtitle=(
        "Real-time pipeline, 100% open source, designed to run on a MacBook M1 "
        "8 GB and switch cleanly to AWS / GCP / Azure with a config-only change."
    ),
)


# ---------------------------------------------------------------------------
# Pipeline diagram: 6 nodes left-to-right, SVG arrows
# ---------------------------------------------------------------------------
C.section_header(
    "The pipeline", icon="pipeline", tone="secondary",
    subtitle="from fridge sensor to pharmacist decision",
)

_NODES = [
    ("thermometer", "Sense",    "SimPy + Python"),
    ("zap",         "Stream",   "Redpanda (Kafka API)"),
    ("database",    "Store",    "TimescaleDB"),
    ("forecast",    "Forecast", "Prophet + Dagster"),
    ("chip",        "Reason",   "Ollama + ChromaDB"),
    ("file-text",   "Act",      "Streamlit + Grafana"),
]

cols = st.columns([1, .15, 1, .15, 1, .15, 1, .15, 1, .15, 1], gap="small")
for i, (icon, title, tech) in enumerate(_NODES):
    with cols[i * 2]:
        C.pipeline_node(icon=icon, title=title, tech=tech)
    if i < len(_NODES) - 1:
        with cols[i * 2 + 1]:
            C.pipeline_arrow()


# Cross-cutting orchestration banner (Dagster)
st.markdown(
    f"""
    <div style="margin-top:1rem;background:#FFFFFF;
                border:1px dashed var(--ms-secondary-border);
                border-radius:var(--ms-radius-md);padding:.75rem 1rem;
                display:flex;justify-content:space-between;align-items:center;gap:.75rem;">
      <div style="display:flex;align-items:flex-start;gap:.55rem;
                  color:var(--ms-text-2);font-size:.875rem;">
        <span style="color:var(--ms-secondary);margin-top:2px;">{I.icon('pipeline', size=16)}</span>
        <span><strong>Cross-cutting orchestration</strong>: Dagster
        software-defined assets: one graph drives batch ingestion,
        ML retraining, and RAG re-indexing. Dagster asset checks = continuous
        data quality.</span>
      </div>
      <span class="ms-pill warn"><span class="dot"></span>Dagster</span>
    </div>
    """,
    unsafe_allow_html=True,
)


# ---------------------------------------------------------------------------
# Deep-dive tabs
# ---------------------------------------------------------------------------
C.section_header("All technical details", icon="search", tone="secondary",
                 subtitle="choices by layer, cloud equivalences, repository layout")

t1, t2, t3, t4, t5, t6, t7 = st.tabs([
    "Sense + Stream", "Store", "Forecast", "Reason (RAG + LLM)", "Act",
    "Multi-cloud", "Repository",
])

with t1:
    st.markdown(
        """
        ### Sense - IoT simulator (SimPy)
        - `simulator/` produces a realistic signal (8 sites × 6 fridges = 48)
          with probabilistic failures, scripted incidents, and Gaussian noise.
        - Output: JSON Kafka events `coldchain.telemetry` every 30 s
          (producer: `simulator/run.py`).

        ### Stream - Redpanda + Python consumer
        - `streaming/consumer.py`: detects anomalies in flight
          (`streaming/anomaly.py`, threshold rules outside 2-8 °C zone:
          30 min WARN, 2 h BREAKAGE_RISK, 4 h CRITICAL). It emits the mirror on
          `coldchain.alerts` and flags suspect lots.
        - Idempotence: alerts are upserted on a functional key
          (fridge + opening timestamp), offset commit happens after write.
        - On abrupt shutdown: Redpanda replays, and the consumer is at-least-once.
        """
    )

with t2:
    st.markdown(
        """
        ### Store - TimescaleDB (Postgres extension)
        - Hypertables `silver.telemetry_raw` (1-day chunks) and
          `silver.alerts` (30-day chunks).
        - Continuous aggregate `silver.telemetry_5m`, refreshed every minute.
        - `silver.forecasts` + `gold.forecast_points` materialize Prophet forecasts;
          `gold.v_*` views are consumed by the UI.
        - Retention policy: raw telemetry purged after 90 days.

        **Why Timescale?**
        Postgres: no new SQL dialect to learn, ACID transactions,
        hypertables = the only extension that combines columnar compression +
        continuous aggregates without breaking the SQL contract.
        """
    )

with t3:
    st.markdown(
        """
        ### Forecast - Prophet on Dagster
        - `ml/shortage_forecast.py`: one Prophet model per
          (site, drug), with weekly + annual seasonality,
          optionally informed by international FDA / ANSM reference signals
          (not India-specific).
        - Nightly retraining (Dagster schedule) + sensor that
          re-materializes the forecast whenever a BREAKAGE_RISK alert lands.
        - Weekly walk-forward backtests (6 folds of 15 days): MAPE and
          80% coverage written to `silver.forecast_backtests`.

        **Outputs**
        - `silver.forecasts` (summary per run) and `gold.forecast_points`
          (daily trajectory: median + 80% confidence band).
        """
    )

with t4:
    st.markdown(
        """
        ### Reason - local RAG + LLM
        - `llm/indexer/run.py`: extraction + chunking (~800 tokens,
          100-token overlap) + ATC metadata to ChromaDB.
        - `llm/rag/`: retrieve top-5 (pre-filtered by ATC code), then
          build the SBAR prompt, then call Ollama in JSON mode.
        - Anchor validation (`llm/rag/validator.py`): each citation
          `[doc:page]` must refer to an actually retrieved chunk,
          otherwise the brief is downgraded with a warning.

        **Why local?**
        No PHI leaves the perimeter. HIPAA / GDPR compliance becomes a
        business argument, not a blocker.
        """
    )

with t5:
    st.markdown(
        """
        ### Act - Streamlit + Grafana
        - **Streamlit**: decision-support surface for pharmacists
          (this app). Multi-page + ``st.fragment`` for live zones.
        - **Grafana**: real-time operations surface (fridges, Kafka lag,
          request latency). Alerting on excursions and lag.
        - **Dagster UI**: engineering surface (asset graph, runs).

        Each surface has a different audience. The same data (Timescale)
        feeds all three.
        """
    )


# ---------------------------------------------------------------------------
# Multi-cloud mapping tab
# ---------------------------------------------------------------------------
with t6:
    st.caption("Each OSS choice has a managed equivalent: "
               "a config change, not a rewrite.")

    import pandas as pd
    mapping = pd.DataFrame([
        ("Streaming bus",        "Redpanda (Kafka API)",     "Amazon MSK",
            "Confluent Cloud",            "Azure Event Hubs"),
        ("Time-series DB",       "TimescaleDB",              "Amazon Timestream",
            "GCP Bigtable",               "Azure Data Explorer"),
        ("Object store",         "MinIO",                    "Amazon S3",
            "Google Cloud Storage",       "Azure Blob"),
        ("Orchestrator",         "Dagster",                  "Dagster Cloud / MWAA",
            "Cloud Composer",             "Azure Data Factory"),
        ("Forecasting",          "Prophet (Python)",         "SageMaker Forecast",
            "Vertex AI Forecast",         "Azure ML Forecast"),
        ("LLM",                  "Ollama (phi3:mini)",       "Bedrock (Claude)",
            "Vertex AI (Gemini)",         "Azure OpenAI"),
        ("Vector store",         "ChromaDB",                 "OpenSearch + KNN",
            "pgvector / Vertex",          "Azure AI Search"),
        ("Embeddings",           "bge-small-en",             "Bedrock Titan",
            "text-embedding-005",         "Azure OpenAI Embeddings"),
        ("Real-time dashboards", "Grafana",                  "Managed Grafana",
            "Cloud Monitoring",           "Azure Monitor"),
        ("App layer",            "Streamlit",                "App Runner",
            "Cloud Run",                  "Azure Container Apps"),
    ], columns=["Layer", "OSS choice", "AWS", "GCP", "Azure"])

    st.dataframe(mapping, hide_index=True, use_container_width=True)


# ---------------------------------------------------------------------------
# Repository layout tab
# ---------------------------------------------------------------------------
with t7:
    st.caption("Where each component lives in the repository.")

    st.code(
        """vigistock/
├── dashboards/streamlit/    # this app (pharmacist UI)
├── docs/                    # architecture, data sources, governance
├── ingestion/               # FDA, openFDA, ANSM, OpenPrescribing (batch)
├── simulator/               # SimPy cold-chain generator to Redpanda
├── streaming/               # producer + consumer + anomaly detection
├── ml/                      # Prophet, backtests, metrics
├── llm/                     # RAG: chunking, indexer, prompt template
├── orchestration/dagster/   # @asset definitions, schedules, sensors
├── sql/                     # Timescale DDL, hypertables, materialized views
├── infra/                   # Dockerfiles, terraform (cloud version)
├── docker-compose.yml       # full local stack
└── Makefile                 # `make help` to orchestrate everything
""",
        language="text",
    )
