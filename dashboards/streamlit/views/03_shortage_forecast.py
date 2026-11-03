"""Shortage forecast: which medication is at risk of running out, and when?

UX intent
---------
The page is structured as a funnel: ranked list -> curve -> action.

1. Top table = risk ranking with probability bars (easy to compare at a glance)
   + marker for a batch affected by an ongoing excursion (causal bridge §8,
   shortage to fridge direction).
2. Middle = the selected medication curve: history + forecast + 80% confidence band.
3. Bottom = explainability (stock, consumption, probability) + CTA to the
   substitution brief.

Language: business terms first. The model reliability is expressed in plain
language ("high") and technical detail (MAPE) stays in a tooltip.
"""
from __future__ import annotations

from datetime import datetime

import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from lib import components as C
from lib.data import M
from lib.theme import TOK

_MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _date_en(iso: str) -> str:
    d = datetime.fromisoformat(iso)
    return f"{d.day} {_MONTHS_EN[d.month - 1]}"


# Drugs for which a lot is affected by an ongoing excursion (§8).
# Derived from data: inventory × open alerts (live) or demo scenario.
_EXCURSION_AFFECTED = M.excursion_affected_drugs()


# ---------------------------------------------------------------------------
# Page header
# ---------------------------------------------------------------------------
C.page_header(
    eyebrow="Operations: forecast",
    icon="forecast",
    title="Shortage forecast",
    subtitle=(
        "Which medications are most likely to run out, and when. 14 to 30 day "
        "horizon, high forecast reliability."
    ),
    tip=(
        "The forecast model (Prophet) is retrained nightly from consumption history. "
        "Its reliability is measured weekly with walk-forward backtests (MAPE and "
        "80% coverage, table silver.forecast_backtests)."
    ),
)


# ---------------------------------------------------------------------------
# KPI row at the top
# ---------------------------------------------------------------------------
data = M.shortage_overview()
total = len(data)
critical = sum(1 for d in data if d["shortage_prob"] >= 0.6)
warn = sum(1 for d in data if 0.3 <= d["shortage_prob"] < 0.6)
soon = min(d["stockout_date"] for d in data)

c1, c2, c3, c4 = st.columns(4, gap="small")
with c1: C.kpi_card(label="Medications tracked", value=total, icon="pill",
                    trend="medications under stock surveillance")
with c2: C.kpi_card(label="High risk", value=critical, icon="flag",
                    tone="crit" if critical else "ok", frame="warn",
                    trend="probability ≥ 60 %, likely to run out within 14 days")
with c3: C.kpi_card(label="Needs attention", value=warn, icon="alert-triangle",
                    tone="warn" if warn else "ok", frame="warn",
                    trend="probability between 30 and 60 %")
with c4: C.kpi_card(label="Soonest stockout", value=_date_en(soon),
                    icon="clock", tone="warn",
                    trend="to anticipate now")


# ---------------------------------------------------------------------------
# Filter row (kept: Sites / Horizon)
# ---------------------------------------------------------------------------
flt_col1, flt_col2 = st.columns([2, 1])
with flt_col1:
    sites = sorted({d["site_id"] for d in data})
    site_sel = st.multiselect("Sites", sites, default=sites)
with flt_col2:
    horizon = st.selectbox("Horizon", ["14 days", "30 days"], index=1)

filtered = [d for d in data if d["site_id"] in site_sel]

# ---------------------------------------------------------------------------
# View selector: the page stays short; each view is one click away.
# (A radio instead of st.tabs: a causal bridge from an excursion page can open
#  the medication detail view directly.)
# ---------------------------------------------------------------------------
_VIEWS = ["Risk ranking", "Medication detail"]

# Pre-filter when coming from the causal bridge of an excursion (§8)
_focus_atc = st.session_state.pop("forecast_focus", None)
if _focus_atc:
    st.session_state["forecast_view"] = _VIEWS[1]
if "forecast_view" not in st.session_state:
    st.session_state["forecast_view"] = _VIEWS[0]

view = st.radio("View", _VIEWS, key="forecast_view",
                horizontal=True, label_visibility="collapsed")


# ===========================================================================
# VIEW 1: Risk ranking (with excursion marker §8)
# ===========================================================================
if view == _VIEWS[0]:
    C.section_header(
        "Risk ranking", icon="forecast",
        subtitle="the “Medication detail” view plots the curve for each one",
    )

    df = pd.DataFrame(filtered)
    df["risk (%)"] = (df["shortage_prob"] * 100).round(0).astype(int)
    df["Cold chain"] = df["atc_code"].map(
        lambda a: "Lot affected by an ongoing excursion"
        if a in _EXCURSION_AFFECTED else "No excursion"
    )
    df = df.rename(columns={
        "drug_name":     "Medication",
        "atc_code":      "ATC",
        "site_id":       "Site",
        "current_stock": "Stock",
        "stockout_date": "Estimated stockout",
    })[["Medication", "ATC", "Site", "Stock", "Estimated stockout",
        "Cold chain", "risk (%)"]]

    st.dataframe(
        df,
        hide_index=True,
        use_container_width=True,
        column_config={
            "risk (%)": st.column_config.ProgressColumn(
                "Stockout probability",
                help="Probability of stockout over the selected horizon.",
                format="%d %%",
                min_value=0, max_value=100,
            ),
            "Stock": st.column_config.NumberColumn("Current stock", format="%d u."),
            "ATC": st.column_config.TextColumn(width="small"),
            "Cold chain": st.column_config.TextColumn(
                help="Bridge to fridge monitoring: is a lot of this drug currently affected by a temperature excursion?"),
        },
    )

    # Reciprocal marker to the causal bridge: stockout to affected fridge (§8)
    affected_in_view = [d for d in filtered if d["atc_code"] in _EXCURSION_AFFECTED]
    if affected_in_view:
        aff = affected_in_view[0]
        exc = _EXCURSION_AFFECTED[aff["atc_code"]]
        C.causal_bridge(
            f"<b>{aff['drug_name']}</b>: batch {exc['lot']} is affected by an ongoing "
            f"temperature excursion ({exc['site']}, fridge {exc['fridge']})."
        )
        with st.container(key="link_bridge_forecast"):
            if st.button("View affected fridge", key="btn_bridge_forecast"):
                st.session_state["selected_fridge"] = exc["fridge"]
                st.switch_page("views/02_cold_chain.py")


# ===========================================================================
# VIEW 2: Medication detail (curve + explainability + action)
# ===========================================================================
else:
    C.section_header(
        "Medication detail", icon="search",
        subtitle="90-day history, forecast and 80% confidence interval",
    )

    _choices = [f"{d['drug_name']} ({d['atc_code']})" for d in filtered]
    _default_idx = 0
    if _focus_atc:
        for i, d in enumerate(filtered):
            if d["atc_code"] == _focus_atc:
                _default_idx = i
                break

    drug_pick = st.selectbox("Medication", _choices, index=_default_idx)
    sel_atc = drug_pick.split("(")[-1].rstrip(")") if drug_pick else "J07BB02"
    sel = next(d for d in filtered if d["atc_code"] == sel_atc)

    curve = M.shortage_forecast_curve(sel_atc, horizon_days=int(horizon.split()[0]))
    hist_df = pd.DataFrame(curve["history"])
    fc_df = pd.DataFrame(curve["forecast"])
    hist_df["ts"] = pd.to_datetime(hist_df["ts"])
    fc_df["ts"] = pd.to_datetime(fc_df["ts"])

    # Chart construction -----------------------------------------------------
    fig = go.Figure()

    # Confidence band (amber: uncertainty zone)
    fig.add_trace(go.Scatter(
        x=fc_df["ts"].tolist() + fc_df["ts"][::-1].tolist(),
        y=fc_df["yhat_upper"].tolist() + fc_df["yhat_lower"][::-1].tolist(),
        fill="toself",
        fillcolor="rgba(180, 83, 9, .12)",
        line=dict(color="rgba(0,0,0,0)"),
        hoverinfo="skip",
        name="80% interval",
    ))

    # Historical stock (green marker)
    fig.add_trace(go.Scatter(
        x=hist_df["ts"], y=hist_df["stock"],
        mode="lines",
        line=dict(color=TOK.brand, width=2),
        name="History",
        hovertemplate="%{x|%d %b}<br><b>%{y} units</b><extra></extra>",
    ))

    # Forecast (amber dotted line)
    fig.add_trace(go.Scatter(
        x=fc_df["ts"], y=fc_df["yhat"],
        mode="lines",
        line=dict(color=TOK.secondary, width=2, dash="dot"),
        name="Forecast",
        hovertemplate="%{x|%d %b}<br><b>%{y:.0f}</b> (forecast)<extra></extra>",
    ))

    # Stockout date marker (red: strictly critical)
    sodate = pd.to_datetime(sel["stockout_date"])
    fig.add_vline(x=sodate, line_color=TOK.alert, line_dash="dash", line_width=1.5)
    fig.add_annotation(
        x=sodate, y=max(fc_df["yhat_upper"].max(), hist_df["stock"].max()) * 0.95,
        text=f"  Estimated stockout<br>  {_date_en(sel['stockout_date'])}",
        showarrow=False,
        bgcolor="rgba(220, 38, 38, .07)",
        bordercolor=TOK.alert,
        borderwidth=1,
        font=dict(color="#B91C1C", size=11),
        xanchor="left",
    )

    fig.update_layout(
        height=380,
        margin=dict(l=10, r=10, t=10, b=10),
        font=dict(family=TOK.font_family, color=TOK.text_secondary, size=11),
        plot_bgcolor="#FFFFFF",
        paper_bgcolor="rgba(0,0,0,0)",
        legend=dict(orientation="h", y=-.18, x=0.5, xanchor="center",
                    bgcolor="rgba(0,0,0,0)"),
        yaxis=dict(title="Available stock (units)",
                   gridcolor=TOK.divider, zerolinecolor=TOK.divider),
        xaxis=dict(gridcolor=TOK.divider),
        hovermode="x unified",
    )
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

    # Explainability row -----------------------------------------------------
    e1, e2, e3 = st.columns(3, gap="small")
    with e1:
        C.kpi_card(label="Current stock",
                   value=f"{sel['current_stock']:,} u.".replace(",", " "),
                   icon="package",
                   trend=f"≈ {sel['current_stock'] / sel['daily_demand_mean']:.0f} days of autonomy")
    with e2:
        C.kpi_card(label="Consumption / day",
                   value=f"{sel['daily_demand_mean']:.0f}",
                   icon="activity",
                   trend=f"variability ± {sel['daily_demand_std']:.1f}")
    with e3:
        C.kpi_card(label="Stockout probability",
                   value=f"{int(sel['shortage_prob']*100)} %",
                   icon="alert-triangle",
                   tone=("crit" if sel["shortage_prob"] >= 0.6
                         else "warn" if sel["shortage_prob"] >= 0.3 else "ok"),
                   trend=f"over the {horizon} horizon")

    # Recommended action: go to the SBAR brief -------------------------------
    C.section_header("Recommended action", icon="file-text")
    C.callout(
        f"Prepare a <strong>substitution SBAR brief</strong> for "
        f"<strong>{sel['drug_name']}</strong>: alternatives in the same class, "
        "network sites with surplus stock, and cited clinical sources.",
        variant="accent",
    )
    if st.button(f"Prepare the brief for {sel['drug_name']}",
                 type="primary", use_container_width=True):
        st.session_state["copilot_drug"] = f"{sel['drug_name']}|{sel['atc_code']}"
        st.switch_page("views/04_clinical_copilot.py")
