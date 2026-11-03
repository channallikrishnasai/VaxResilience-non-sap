"""Operations overview: main dashboard page.

UX intent
---------
The user is time-pressed (pharmacist, clinician). The page is no longer a wall of
metrics: it is a PRIORITIZED ACTION FLOW in 3 reading levels, meant to be
understood in 3 seconds:

1. ACTION: "Immediate attention" - two alert cards with human language and direct
   action buttons.
2. CONTEXT: "At a glance" - 3 clean KPI tiles with semantic color coding.
3. TECHNICAL HEALTH: a slim status bar at the bottom of the page.

Live behavior
-------------
KPI values and alerts refresh every 15 seconds via ``st.fragment(run_every=…)``;
only the fragment reruns, preserving scroll position and widget state.
"""
from __future__ import annotations

from datetime import datetime

import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st
from lib import components as C
from lib.data import M
from lib.theme import TOK, fridge_state, state_color

# ---------------------------------------------------------------------------
# Local helpers
# ---------------------------------------------------------------------------
_MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _date_en(iso: str) -> str:
    """Convert ``2026-06-18`` to ``18 Jun``."""
    d = datetime.fromisoformat(iso)
    return f"{d.day} {_MONTHS_EN[d.month - 1]}"


# Short English labels for at-risk products
_DRUG_SHORT = {
    "Influenza vaccine (inactivated)": "Influenza",
    "Insulin glargine": "Insulin glargine",
    "Amoxicillin/clavulanate": "Amoxicillin",
    "MMR vaccine": "MMR",
    "Insulin detemir": "Insulin detemir",
}


# ---------------------------------------------------------------------------
# Page header
# ---------------------------------------------------------------------------
kpis = M.kpi_snapshot()

C.page_header(
    eyebrow="Operations (live)",
    icon="tower",
    title="Overview",
    subtitle=(
        f"{kpis['sites_total']} hospital sites, {kpis['fridges_total']} refrigerators "
        "under continuous monitoring. The highest-priority actions appear first."
    ),
)


# ===========================================================================
# LEVEL 1 (ACTION): "Immediate attention"
# Everything is derived from live data (alerts, affected lots, forecast risk).
# ===========================================================================
C.section_header("Immediate attention", icon="flag", tone="crit")

shortages = M.shortage_overview()
at_risk = [d for d in shortages if d["shortage_prob"] >= 0.3]
nearest = min(d["stockout_date"] for d in shortages) if shortages else None
risk_names = ", ".join(_DRUG_SHORT.get(d["drug_name"], d["drug_name"]) for d in at_risk)

# Most recent critical alert + affected lot (excursion-to-shortage bridge)
alerts = M.recent_alerts()
top_crit = next((a for a in alerts if a["level"] == "crit"), None)
affected = M.excursion_affected_drugs()
aff_atc, aff = (next(iter(affected.items())) if affected else (None, None))
# Probability of shortage for the affected medication (quantified causal link)
aff_prob = next((d["shortage_prob"] for d in shortages
                 if aff_atc and d["atc_code"] == aff_atc), None)

col_crit, col_warn = st.columns(2, gap="medium")

# -- CRITICAL CARD: the ongoing excursion, told in human language -----------
with col_crit:
    if top_crit and aff:
        C.alert_card(
            level="crit",
            icon="thermometer",
            title=top_crit["title"].split(" (")[0].strip(),
            body_html=(
                f"<b>{top_crit['site']}</b> : {top_crit['msg']}<br/>"
                f"{aff['doses']} doses of {_DRUG_SHORT.get(aff['drug_name'], aff['drug_name'])} "
                f"at risk (lot {aff['lot']})."
            ),
        )
        # Excursion-to-shortage causal bridge (§8): central product story.
        prob_txt = (f"<b>shortage risk: {int(aff_prob * 100)} %</b>"
                    if aff_prob else "<b>stock already under pressure</b>")
        C.causal_bridge(
            f"This batch feeds stock already under pressure: {prob_txt} for "
            f"{_DRUG_SHORT.get(aff['drug_name'], aff['drug_name'])}."
        )
        with st.container(key="link_bridge_overview"):
            if st.button("View the impact on shortages", key="btn_bridge_overview"):
                st.session_state["forecast_focus"] = aff_atc
                st.switch_page("views/03_shortage_forecast.py")

        # Action buttons: one verb, one decision.
        a1, a2 = st.columns(2, gap="small")
        with a1:
            if st.button("Quarantine the lot", type="primary",
                         use_container_width=True, key="btn_quarantine_overview"):
                st.toast(f"Lot {aff['lot']} marked as suspect "
                         f"({aff['doses']} doses blocked).")
        with a2:
            if st.button("View 24h detail", use_container_width=True,
                         key="btn_detail_overview"):
                st.session_state["selected_fridge"] = aff["fridge"]
                st.switch_page("views/02_cold_chain.py")
    else:
        C.alert_card(
            level="resolved",
            icon="check-circle",
            title="No critical excursion in progress",
            body_html="All refrigerators are within the safe 2-8 °C zone.",
        )

# -- WATCH CARD: expected shortages ------------------------------------------
with col_warn:
    if at_risk:
        C.alert_card(
            level="warn",
            icon="forecast",
            title=f"{len(at_risk)} medications at risk of running out",
            body_html=(
                f"Forecast over 14 to 30 days: {risk_names}.<br/>"
                f"The nearest stockout is estimated for "
                f"<b>{_date_en(nearest)}</b>."
            ),
        )
    else:
        C.alert_card(
            level="resolved",
            icon="forecast",
            title="No expected shortages",
            body_html="No monitored medication exceeds 30% stockout probability over the 14-30 day horizon.",
        )
    with st.container(key="amber_open_forecast"):
        if st.button("Open the shortage forecast",
                     use_container_width=True, key="btn_open_forecast"):
            st.switch_page("views/03_shortage_forecast.py")


# ===========================================================================
# LEVEL 2 (CONTEXT): “At a glance”
# ===========================================================================
C.section_header("Network overview", icon="eye",
                 subtitle="updated every 15 seconds")


@st.fragment(run_every=15)
def render_kpis() -> None:
    k = M.kpi_snapshot()
    ok_fridges = k["fridges_total"] - k["open_alerts"]
    C.kpi_strip([
        dict(label="Open alerts", value=k["open_alerts"], icon="flag",
             tone="crit" if k["critical_alerts"] else "warn" if k["open_alerts"] else "ok",
             frame="warn",
             trend=f"{k['critical_alerts']} critical, {k['warn_alerts']} moderate"),
        dict(label="Lots to review", value=k["suspect_lots"], icon="package",
             tone="warn" if k["suspect_lots"] else "ok", frame="warn",
             trend="waiting for review"),
        dict(label="Refrigerators monitored", value=k["fridges_total"], icon="fridge",
             tone="ok",
             trend=f"{ok_fridges} OK, {k['open_alerts']} in alert"),
    ])


render_kpis()


# ===========================================================================
# Body: refrigerators to monitor (left) • alert feed + services (right)
# ===========================================================================
left, right = st.columns([2, 1], gap="large")

with left:
    C.section_header(
        "Cold chain", icon="fridge",
        subtitle="urgent fridges, excursions by site",
    )

    @st.fragment(run_every=15)
    def render_critical_fridges() -> None:
        fleet = M.fleet_snapshot()
        ranked = sorted(
            fleet,
            key=lambda f: {"crit": 0, "warn": 1, "ok": 2}[fridge_state(f["temp_c"])],
        )
        attention = [f for f in ranked if fridge_state(f["temp_c"]) != "ok"][:6]
        if not attention:
            C.callout("<strong>No fridge is outside tolerance.</strong> "
                      "The entire network is within the safe 2-8 °C range.")
            return
        for i in range(0, len(attention), 3):
            cols = st.columns(3, gap="small")
            for col, f in zip(cols, attention[i:i + 3], strict=False):
                with col:
                    C.fridge_tile(f)

    # Tabs: the page stays short; each view is one click away.
    tab_fridges, tab_heat = st.tabs(
        ["Refrigerators to monitor", "Excursions by site (24h)"])

    with tab_fridges:
        render_critical_fridges()

    with tab_heat:
        st.caption("Minutes out of tolerance by time slot "
                   "(illustrative demo scenario).")
        fleet_now = M.fleet_snapshot()
        rng = np.random.default_rng(7)
        sites = list({f["site"] for f in fleet_now})
        hours = [f"{h:02d}h" for h in range(24)]
        matrix = rng.poisson(lam=2.0, size=(len(sites), 24))

        # Demo scenario faults, only if the site exists in the served fleet
        # (in live mode, names come from the database).
        def _plant(site: str, hour: int, minutes: int) -> None:
            if site in sites:
                matrix[sites.index(site), hour] = minutes

        _plant("Bengaluru Central Demo Hospital", 22, 38)
        _plant("Bengaluru Central Demo Hospital", 23, 26)
        _plant("Mysuru Demo Hospital", 21, 18)
        _plant("Mysuru Demo Hospital", 22, 42)
        _plant("Bengaluru North Demo Hospital", 14, 11)

        df = pd.DataFrame(matrix, index=sites, columns=hours)
        fig = px.imshow(
            df,
            labels=dict(x="Hour", y="Site", color="minutes out of tolerance"),
            # Heat scale: cold white to amber then red.
            color_continuous_scale=[
                [0.00, "#F8FAFC"],
                [0.20, TOK.secondary_subtle],
                [0.55, TOK.secondary],
                [1.00, TOK.alert],
            ],
            aspect="auto",
        )
        fig.update_layout(
            height=260,
            margin=dict(l=10, r=10, t=10, b=20),
            coloraxis_colorbar=dict(thickness=10, len=0.8),
            font=dict(family=TOK.font_family, color=TOK.text_secondary, size=12),
            plot_bgcolor="#FFFFFF",
            paper_bgcolor="rgba(0,0,0,0)",
        )
        fig.update_xaxes(showgrid=False, tickfont=dict(size=10))
        fig.update_yaxes(showgrid=False, tickfont=dict(size=11))
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})


with right:
    C.section_header("Activity", icon="activity", subtitle="live")

    @st.fragment(run_every=15)
    def render_alerts_feed() -> None:
        # 3 visible alerts; the rest sit behind “View more” so the column remains balanced.
        alerts = M.recent_alerts()
        for a in alerts[:3]:
            C.feed_item(
                title=a["title"], site=a["site"], msg=a["msg"], ts=a["ts"],
                color=state_color(a["level"]), tech=a.get("tech", ""),
            )
        if len(alerts) > 3:
            # Text link (not a block): toggles the rest of the feed.
            def _toggle_feed() -> None:
                st.session_state["feed_expanded"] = \
                    not st.session_state.get("feed_expanded", False)

            expanded = st.session_state.get("feed_expanded", False)
            lbl = ("View less" if expanded
                   else f"View more ({len(alerts) - 3} alerts)")
            with st.container(key="link_more_alerts"):
                st.button(lbl, key="btn_more_alerts", on_click=_toggle_feed)
            if expanded:
                for a in alerts[3:]:
                    C.feed_item(
                        title=a["title"], site=a["site"], msg=a["msg"],
                        ts=a["ts"], color=state_color(a["level"]),
                        tech=a.get("tech", ""),
                    )

    _SERVICE_ROLES = {
        "Ollama":      "Brief generation",
        "Redpanda":    "Telemetry stream",
        "TimescaleDB": "Database",
        "ChromaDB":    "Document index",
        "Dagster":     "Orchestration",
        "Grafana":     "Technical monitoring",
    }

    tab_feed, tab_svc = st.tabs(["Alert feed", "Service status"])

    with tab_feed:
        render_alerts_feed()

    with tab_svc:
        for svc in M.services_status():
            role = _SERVICE_ROLES.get(svc["name"], svc["name"])
            st.markdown(
                f"""
                <div style="display:flex;justify-content:space-between;align-items:center;
                            padding:.5rem .75rem;background:var(--ms-bg);
                            border:1px solid var(--ms-border);
                            border-radius:8px;margin-bottom:.35rem;"
                     title="{svc['name']} : {svc['detail']}">
                  <div style="display:flex;align-items:center;gap:.5rem;">
                    <span style="width:8px;height:8px;border-radius:50%;
                                background:{state_color(svc['state'])};"></span>
                    <span style="font-weight:600;color:var(--ms-text);
                                 font-size:.875rem;">{role}</span>
                  </div>
                  <div style="font-size:.72rem;color:var(--ms-text-3);">{svc['name']}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )


# ===========================================================================
# Next actions: where do you want to go?
# ===========================================================================
C.section_header("Next actions", icon="arrow-right",
                 subtitle="where do you want to go?")

c1, c2, c3 = st.columns(3, gap="small")
with c1:
    if st.button("See all refrigerators",
                 use_container_width=True, type="primary"):
        st.switch_page("views/02_cold_chain.py")
with c2:
    if st.button("Open the shortage forecast",
                 use_container_width=True, key="btn_next_forecast"):
        st.switch_page("views/03_shortage_forecast.py")
with c3:
    if st.button("Prepare an SBAR brief",
                 use_container_width=True):
        st.switch_page("views/04_clinical_copilot.py")


# ===========================================================================
# LEVEL 3 (TECHNICAL HEALTH): a subtle bar at the bottom of the page.
# ===========================================================================
C.section_header("Pipeline & data", icon="pipeline", tone="secondary")

from lib.data import data_mode

tcol1, tcol2 = st.columns([4, 1.2], gap="small")
with tcol1:
    C.tech_bar(events_per_min=kpis["events_per_min"],
               uptime_pct=kpis["uptime_pct"],
               source_label=data_mode()["label"])
with tcol2:
    st.page_link("views/06_architecture.py", label="Pipeline architecture")
