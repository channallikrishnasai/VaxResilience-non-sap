"""Data quality: Dagster asset checks + pipeline health.

UX intent
---------
Page in the "Pipeline & data" section: the technical vocabulary is legitimate
here. It exposes the asset checks the pipeline runs continuously to verify at a
glance that the data layer is observed, not just delivered.

Layout
------
1. KPI band: pass / warn / fail counts + freshness gauge.
2. Asset-checks table: filterable by asset + severity.
3. Recent Dagster runs: short list with duration and status.
4. Embedding drift mini-chart for the RAG corpus: closes the loop on the LLM.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from lib import components as C
from lib.data import M
from lib.theme import TOK

# ---------------------------------------------------------------------------
# Header (ambient tone: Pipeline & data section)
# ---------------------------------------------------------------------------
C.page_header(
    eyebrow="Pipeline & data",
    icon="bar-chart",
    tone="secondary",
    title="Data quality",
    subtitle=(
        "Automatic checks that continuously verify pipeline data is reliable: "
        "freshness, schema, volumes, drift. If quality degrades, the pipeline does "
        "not ship data; it raises an alert."
    ),
)


# ---------------------------------------------------------------------------
# KPI band
# ---------------------------------------------------------------------------
checks = M.asset_checks()
p = sum(1 for c in checks if c["result"] == "pass")
w = sum(1 for c in checks if c["result"] == "warn")
f = sum(1 for c in checks if c["result"] == "fail")
score = round(100 * p / max(1, len(checks)))

# Be explicit about what is being measured: automatic data-quality controls,
# not just a number without context.
c1, c2, c3, c4 = st.columns(4, gap="small")
with c1:
    C.kpi_card(label="Checks passed", value=p, icon="check-circle",
               tone="ok" if p == len(checks) else "warn",
               trend=f"out of {len(checks)} automatic data-quality checks ({score} %)")
with c2:
    C.kpi_card(label="Needs review", value=w, icon="alert-triangle",
               tone="warn" if w else "ok", frame="warn",
               trend="check(s) indicating drift, to verify during the day")
with c3:
    C.kpi_card(label="Failed", value=f, icon="x-circle",
               tone="crit" if f else "ok", frame="warn",
               trend="check(s) blocking downstream data updates")
with c4:
    C.kpi_card(label="Last data received",
               value=M.telemetry_freshness(),
               icon="clock", tone="ok",
               trend="age of the latest measurement, target: under 5 minutes")


# ---------------------------------------------------------------------------
# Asset-checks table
# ---------------------------------------------------------------------------
from lib.data import data_mode

# Honest provenance: only "live" if the Dagster webserver is really responding,
# not just the database (otherwise the checks remain demo values).
_dagster_up = (data_mode()["mode"] == "live"
               and getattr(M, "dagster_available", lambda: False)())
_src = "live (Dagster webserver)" if _dagster_up else "demo values"

# ---------------------------------------------------------------------------
# Tabs: the page fits on one screen, one click per panel.
# ---------------------------------------------------------------------------
tab_checks, tab_runs, tab_drift = st.tabs(
    ["Automatic checks", "Dagster runs", "RAG drift"])


with tab_checks:
    C.section_header(
        "Automatic checks", icon="check-circle", tone="secondary",
        subtitle="each data table has its own checks, executed on every Dagster run",
        right=_src,
    )

    filter_col1, filter_col2 = st.columns([2, 1])
    with filter_col1:
        assets = sorted({c["asset"] for c in checks})
        asset_filter = st.multiselect("Data tables", assets, default=assets)
    with filter_col2:
        severity_filter = st.multiselect(
            "Result", ["pass", "warn", "fail"],
            default=["pass", "warn", "fail"], format_func=str.upper,
        )

    filtered = [c for c in checks
                if c["asset"] in asset_filter and c["result"] in severity_filter]

    df = pd.DataFrame(filtered)
    df["Status"] = df["result"].map({"pass": "PASS", "warn": "WARN", "fail": "FAIL"})
    df = df.rename(columns={
        "asset":     "Data table",
        "check":     "Automatic check",
        "value":     "Observed value",
        "last_run":  "Last run",
    })[["Data table", "Automatic check", "Status", "Observed value", "Last run"]]

    st.dataframe(df, hide_index=True, use_container_width=True)


with tab_runs:
    C.section_header("Recent Dagster runs", icon="refresh", tone="secondary",
                     right=_src)

    runs = M.dagster_runs()
    cols = st.columns(len(runs), gap="small")
    for col, r in zip(cols, runs, strict=False):
        state = "ok" if r["status"] == "ok" else ("warn" if r["status"] == "warn" else "crit")
        mins, secs = divmod(r["duration_s"], 60)
        duration = (f"{mins // 60}h {mins % 60:02d}m" if mins >= 60
                    else f"{mins} min {secs:02d}")
        with col:
            st.markdown(
                f"""
                <div class="ms-tile {state}">
                  <div class="ms-tile-id">{r['job']}</div>
                  <div style="display:flex;justify-content:flex-end;align-items:flex-end;
                              margin-top:.45rem;">
                    <span class="ms-pill {state}"><span class="dot"></span>{r['status'].upper()}</span>
                  </div>
                  <div class="ms-tile-meta" style="margin-top:.45rem;">
                    <span><b>Duration</b> {duration}</span>
                    <span><b>Start</b> {r['started']}</span>
                  </div>
                </div>
                """,
                unsafe_allow_html=True,
            )


with tab_drift:
    C.section_header(
        "Embedding drift (RAG corpus)", icon="activity", tone="secondary",
        subtitle="average distance to centroids by index version, alert threshold 0.05",
        right="demo values",
    )

    rng = np.random.default_rng(11)
    days = pd.date_range("2026-05-14", periods=14, freq="D")
    drift = 0.012 + rng.normal(0, .003, size=14).cumsum() * .15
    drift = np.clip(drift, 0.005, 0.055)
    drift[-1] = 0.018  # current value

    fig = go.Figure()
    fig.add_hrect(y0=0, y1=0.05,
                  fillcolor="rgba(22, 163, 74, .05)", line_width=0)
    fig.add_hrect(y0=0.05, y1=0.08,
                  fillcolor="rgba(220, 38, 38, .05)", line_width=0)
    fig.add_hline(y=0.05, line_dash="dash", line_color=TOK.alert, line_width=1)

    fig.add_trace(go.Scatter(
        x=days, y=drift,
        mode="lines+markers",
        line=dict(color=TOK.secondary, width=2),
        marker=dict(color=TOK.secondary, size=6,
                    line=dict(color="#FFFFFF", width=1)),
        fill="tozeroy",
        fillcolor="rgba(180, 83, 9, .08)",
        name="drift",
        hovertemplate="%{x|%d %b}<br><b>%{y:.3f}</b><extra></extra>",
    ))
    fig.update_layout(
        height=260,
        margin=dict(l=10, r=10, t=10, b=10),
        font=dict(family=TOK.font_family, color=TOK.text_secondary, size=11),
        plot_bgcolor="#FFFFFF", paper_bgcolor="rgba(0,0,0,0)",
        showlegend=False,
        yaxis=dict(title="Average distance", gridcolor=TOK.divider,
                   zerolinecolor=TOK.divider, range=[0, 0.08]),
        xaxis=dict(gridcolor=TOK.divider),
    )
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

    C.callout(
        "<strong>Readout.</strong> The indexed documents are examples; no Indian regulatory or clinical source feed is connected. "
        "drifts slowly with each re-indexing. As long as the average distance to the "
        "centroids stays under <code>0.05</code>, queries remain stable. Beyond that, a "
        "fine-tuned re-ranker is triggered.",
        variant="warn",
    )
