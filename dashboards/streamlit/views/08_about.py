"""About: author profile, problem framing, stack, governance.

UX intent
---------
This is the *portfolio* surface. A visitor arriving in the first two minutes
should see:

1. Who built this and why (dual data engineer / former nurse profile).
2. What concrete problem it solves (one paragraph).
3. The stack shown as a compact grid.
4. Governance and warnings (portfolio, not a medical device).
5. Where to go next (CTAs to the key pages).
"""
from __future__ import annotations

import streamlit as st
from lib import components as C
from lib import icons as I

# ---------------------------------------------------------------------------
# Header
# ---------------------------------------------------------------------------
C.hero(
    eyebrow="Project: data engineering portfolio",
    title="VaxResilience: cold chain, shortages, clinical support",
    subtitle=(
        "A portfolio project blending real-time streaming, ML "
        "(Prophet), local LLM RAG, and Dagster orchestration to solve a "
        "concrete hospital problem using a 100% open-source stack."
    ),
    meta={
        "AUTHOR": "Lohana Utim",
        "BACKGROUND": "Data Engineer, former nurse (6 years)",
        "STACK": "Python, Postgres, Kafka, Ollama",
        "STATUS": "Portfolio, runs on a laptop",
    },
)


# ---------------------------------------------------------------------------
# Problem framing
# ---------------------------------------------------------------------------
left, right = st.columns([1.6, 1], gap="large")

with left:
    C.section_header("The project story", icon="book-open",
                     subtitle="three reads: from concrete to technical")

    tab_pb, tab_story, tab_de = st.tabs(
        ["The problem", "Demo scenario", "What the project shows"])

    with tab_pb:
        st.markdown(
            """
            > *"On Monday, a demo hospital pharmacy fridge in Bengaluru rose to 14 °C for
            > 4 hours. By Friday, three fictional hospitals in the demo network were out of
            > pediatric influenza vaccine and the on-call doctor had to call ten
            > services to find a substitute."*

            This is an **illustrative India-focused scenario**, not a report about a
            real Bengaluru hospital or a current Indian medicine shortage. The
            repository has no automated India-specific shortage feed. Its FDA, ANSM,
            and NHS integrations are international references; CDSCO and NPPA are
            listed as official Indian reference sources but are not integrated feeds.

            The pharmacist or nurse reacting to a shortage today juggles three siloed
            tools: a fridge dashboard, an inventory system, and a pile of PDF
            substitution protocols. **VaxResilience demonstrates how these could be
            brought together** in a
            single event pipeline that detects the excursion, predicts downstream
            stockout risk, and drafts an illustrative brief. The hospital names,
            stock, and telemetry shown here are illustrative, not live data.
            """
        )

    with tab_story:
        st.markdown(
            """
            | Step | What happens | Where in the code |
            |---|---|---|
            | **1. Sense** | A simulated fridge at a fictional Bengaluru site publishes temperature + humidity every 30 s via Redpanda. | `simulator/` |
            | **2. Detect** | A Python consumer flags an excursion >8 °C lasting more than 2 h as `BREAKAGE_RISK` and marks the suspect batch. | `streaming/consumer.py` |
            | **3. Forecast** | Prophet retrains the regional demand model, removes suspect doses, and predicts a stockout in 9 days. | `ml/shortage_forecast.py` |
            | **4. Recommend** | Ollama (phi3:mini) retrieves example documents through ChromaDB RAG and drafts an illustrative SBAR brief. | `llm/rag/` |
            | **5. Alert** | Grafana raises the IoT alert in real time; Streamlit shows the brief to the pharmacist. | `dashboards/streamlit/` |

            In short: **a sensor drift becomes a clinical action plan in under a minute, with sources attached.**
            """
        )

    with tab_de:
        st.markdown(
            """
            This repo shows, in one project:

            - **Real-time streaming** with at-least-once semantics
              (Redpanda, then Python consumer, then hypertable Timescale +
              continuous aggregates).
            - **A well-designed lambda architecture**: streaming for telemetry,
              batch for slow public APIs; both in the same time-series store.
            - **Anomaly detection in flight** (rolling Z-score + duration threshold),
              not post-hoc.
            - **Production-shaped ML**: Prophet retrained on a Dagster schedule,
              predictions written to Postgres and evaluated through backtests.
            - **Modern RAG pattern**: chunk, embed, vector store, retrieval, LLM,
              with source citations from PDF references.
            - **Healthcare data governance**: HIPAA & GDPR-aligned patterns are
              documented in `docs/governance_hipaa_rgpd.md`. No PHI leaves the
              perimeter: the LLM is local.
            - **CI/CD with services** (Redpanda + Timescale testcontainers in GitHub
              Actions).
            """
        )


with right:
    C.section_header("Profile", icon="user")
    st.markdown(
        f"""
        <div style="background:#FFFFFF;border:1px solid var(--ms-border);
                    border-radius:var(--ms-radius-lg);padding:1.25rem;
                    box-shadow:var(--ms-shadow-sm);">
          <div style="display:flex;align-items:center;gap:.75rem;">
            {I.logo(44)}
            <div>
              <div style="font-weight:700;color:var(--ms-text);">Lohana Utim</div>
              <div style="color:var(--ms-text-2);font-size:.85rem;">Data Engineer, former nurse</div>
            </div>
          </div>
          <div style="margin-top:.85rem;color:var(--ms-text-2);font-size:.875rem;
                      line-height:1.8;">
            Dual profile:<br/>
            <strong>Data Engineer</strong><br/>
            <strong>Project management</strong><br/>
            <strong>6 years of field experience in hospital settings</strong>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    C.section_header("Technical stack", icon="layers")
    items = [
        ("Streaming", "Redpanda (Kafka API)", "zap"),
        ("Storage", "TimescaleDB + MinIO", "database"),
        ("Orchestration", "Dagster (software-defined assets)", "pipeline"),
        ("ML", "Prophet + scikit-learn", "forecast"),
        ("LLM", "Ollama (phi3:mini)", "chip"),
        ("Vector store", "ChromaDB + bge-small", "search"),
        ("Dashboards", "Streamlit, Plotly, Grafana", "bar-chart"),
        ("Tests", "pytest + testcontainers", "check-circle"),
        ("CI", "GitHub Actions", "refresh"),
    ]
    for name, role, icon_name in items:
        C.stack_item(name, role, icon_name)

    C.section_header("Compliance", icon="shield")
    C.callout(
        "        <strong>Privacy-focused demo</strong>: no patient data is used, the LLM is local, and the audit trail is append-only. This is not a legal compliance claim. See "
        "<code>docs/governance_hipaa_rgpd.md</code>.",
    )
    C.callout(
        "<strong>Warning</strong>: this project is a portfolio demo. It is <em>not</em> a medical device, is not CDSCO-approved or clinically validated, and must not be used for patient care or hospital operations.",
        variant="alert",
    )


# ---------------------------------------------------------------------------
# CTAs to key pages
# ---------------------------------------------------------------------------
C.section_header("Continue the tour", icon="arrow-right",
                 subtitle="three entry points")

c1, c2, c3 = st.columns(3, gap="small")
with c1:
    st.markdown(
        """
        <div style="background:#FFFFFF;border:1px solid var(--ms-border);
                    border-radius:var(--ms-radius-md);padding:1rem;height:100%;">
          <div style="font-size:.7rem;color:var(--ms-secondary);text-transform:uppercase;
                      letter-spacing:.08em;font-weight:700;">Architecture</div>
          <div style="font-weight:700;color:var(--ms-text);margin-top:.25rem;">
            The pipeline architecture
          </div>
          <div style="color:var(--ms-text-2);font-size:.875rem;margin:.5rem 0;">
            Detailed pipeline, cloud mapping, and motivated technical choices.
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    with st.container(key="link_visit_archi"):
        if st.button("Open the pipeline architecture", key="btn_visit_archi"):
            st.switch_page("views/06_architecture.py")

with c2:
    st.markdown(
        """
        <div style="background:#FFFFFF;border:1px solid var(--ms-border);
                    border-radius:var(--ms-radius-md);padding:1rem;height:100%;">
          <div style="font-size:.7rem;color:var(--ms-secondary);text-transform:uppercase;
                      letter-spacing:.08em;font-weight:700;">Data engineering</div>
          <div style="font-weight:700;color:var(--ms-text);margin-top:.25rem;">
            Data quality
          </div>
          <div style="color:var(--ms-text-2);font-size:.875rem;margin:.5rem 0;">
            Dagster asset checks, freshness contracts, and RAG drift.
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    with st.container(key="link_visit_quality"):
        if st.button("Open data quality", key="btn_visit_quality"):
            st.switch_page("views/07_data_quality.py")

with c3:
    st.markdown(
        """
        <div style="background:#FFFFFF;border:1px solid var(--ms-border);
                    border-radius:var(--ms-radius-md);padding:1rem;height:100%;">
          <div style="font-size:.7rem;color:var(--ms-brand);text-transform:uppercase;
                      letter-spacing:.08em;font-weight:700;">Clinical</div>
          <div style="font-weight:700;color:var(--ms-text);margin-top:.25rem;">
            The SBAR brief
          </div>
          <div style="color:var(--ms-text-2);font-size:.875rem;margin:.5rem 0;">
            Live substitution brief, 4-criteria + 5-right validation.
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    with st.container(key="link_visit_sbar"):
        if st.button("Open the SBAR brief", key="btn_visit_sbar"):
            st.switch_page("views/04_clinical_copilot.py")
