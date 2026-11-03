"""Refrigerators: complete fleet inventory with drill-down.

UX intent
---------
Dense list, quick filters, zoomable detail, *master/detail* layout:

* **Filter bar at the top**: site + status + sort on a single line.
* **Main grid**: each fridge as a tile, sorted by criticality so the eye lands
  on what matters without scrolling.
* **Detail panel**: 24h temperature with tolerance bands, affected lots,
  quarantine action, and the excursion-to-shortage causal link (§8) when the
  fridge is in alert.

Language: human labels throughout; technical thresholds stay in the tooltip.
"""
from __future__ import annotations

import pandas as pd
import plotly.graph_objects as go
import streamlit as st
from lib import components as C
from lib.data import M
from lib.theme import (
    TEMP_CRIT_HIGH,
    TEMP_OK_HIGH,
    TEMP_OK_LOW,
    TOK,
    fridge_state,
    state_label,
)

# ---------------------------------------------------------------------------
# Page header
# ---------------------------------------------------------------------------
C.page_header(
    eyebrow="Operations: cold chain",
    icon="fridge",
    title="Refrigerators",
    subtitle="Current state of every fridge in the network, most urgent first.",
    tip=(
        "Safe zone 2-8 °C (WHO PQS E003 reference). "
        "Above 8 °C: monitor. Above 10 °C: critical, the lot must be checked."
    ),
)


# ---------------------------------------------------------------------------
# Filter bar (kept: Site / Status / Sort)
# ---------------------------------------------------------------------------
fleet = M.fleet_snapshot()
sites = ["All sites", *sorted({f["site"] for f in fleet})]

# Filters in a card panel: command area is visible at a glance.
with st.container(key="panel_fridges_filters"):
    f_col1, f_col2, f_col3, f_col4 = st.columns([2, 1.5, 1.5, 1])

    with f_col1:
        site = st.selectbox("Site", sites, index=0)
    with f_col2:
        state_filter = st.multiselect(
            "Status", ["ok", "warn", "crit"], default=["warn", "crit"],
            format_func=state_label,
        )
    with f_col3:
        sort_by = st.selectbox(
            "Sort", ["Criticality (desc.)", "Temperature (desc.)", "Fridge ID"],
        )
    with f_col4:
        st.write("")
        st.write("")
        if st.button("Refresh", use_container_width=True):
            st.rerun()


# Apply filters
filtered = [f for f in fleet if site == "All sites" or f["site"] == site]
if state_filter:
    filtered = [f for f in filtered if fridge_state(f["temp_c"]) in state_filter]

# Apply sort
if sort_by == "Criticality (desc.)":
    rank = {"crit": 0, "warn": 1, "ok": 2}
    filtered.sort(key=lambda f: (rank[fridge_state(f["temp_c"])], -f["temp_c"]))
elif sort_by == "Temperature (desc.)":
    filtered.sort(key=lambda f: -f["temp_c"])
else:
    filtered.sort(key=lambda f: f["fridge_id"])


# ---------------------------------------------------------------------------
# KPI row (semantic top border)
# ---------------------------------------------------------------------------
counts = {"ok": 0, "warn": 0, "crit": 0}
for f in filtered:
    counts[fridge_state(f["temp_c"])] += 1

c1, c2, c3, c4 = st.columns(4, gap="small")
with c1:
    C.kpi_card(label="Fridges shown", value=len(filtered), icon="fridge",
               trend=f"across {len({f['site'] for f in filtered})} sites")
with c2:
    _ok_tone = ("ok" if filtered and counts["ok"] == len(filtered) else "warn")
    C.kpi_card(label="OK", value=counts["ok"], icon="check-circle",
               tone=_ok_tone,
               trend="within the safe zone 2-8 °C")
with c3:
    C.kpi_card(label="Monitor", value=counts["warn"], icon="alert-triangle",
               tone="warn" if counts["warn"] else "ok", frame="warn",
               trend="fridges above 8 °C")
with c4:
    C.kpi_card(label="Critical", value=counts["crit"], icon="thermometer",
               tone="crit" if counts["crit"] else "ok", frame="crit",
               trend="fridges above 10 °C, lots to review")


# ---------------------------------------------------------------------------
# Layout maître / détail
# ---------------------------------------------------------------------------
# Grille pleine largeur, détail en dessous : plus de colonne orpheline.
with st.container():
    C.section_header(
        "Fridge grid", icon="fridge",
        subtitle=f"{len(filtered)} results",
        right="click \"View 24h detail\"",
    )

    if "selected_fridge" not in st.session_state:
        st.session_state.selected_fridge = filtered[0]["fridge_id"] if filtered else None

    if not filtered:
        C.callout("No refrigerator matches the selected filters.")
    else:
        for i in range(0, len(filtered), 3):
            row = st.columns(3, gap="small")
            for col, f in zip(row, filtered[i:i + 3], strict=False):
                with col:
                    clicked = C.fridge_tile(f, on_click_key=f"btn_{f['fridge_id']}")
                    if clicked:
                        st.session_state.selected_fridge = f["fridge_id"]
                        st.rerun()


with st.container():
    sel = st.session_state.get("selected_fridge")
    selected = next((f for f in fleet if f["fridge_id"] == sel), None)

    if not selected:
        C.callout("Select a fridge to open its 24h detail.")
    else:
        C.section_header(
            f"Fridge detail {selected['fridge_id']}", icon="search",
            subtitle=f"{selected['site']}, {selected['lots']} active lots",
            right=f"last reading {C.fmt_heure(selected['last_seen'])}",
        )

        # Priority first: the excursion-to-shortage causal bridge (§8) is the
        # first thing visible if this fridge hosts a lot under pressure.
        sel_state = fridge_state(selected["temp_c"])
        _aff_here = next(
            ((atc, a) for atc, a in M.excursion_affected_drugs().items()
             if a["fridge"] == selected["fridge_id"]),
            None,
        )
        if sel_state != "ok" and _aff_here:
            _atc, _aff = _aff_here
            _prob = next((d["shortage_prob"] for d in M.shortage_overview()
                          if d["atc_code"] == _atc), None)
            _prob_txt = (f"<b>stockout risk: {int(_prob * 100)} %</b>"
                         if _prob else "<b>stock already under pressure</b>")
            C.causal_bridge(
                f"This fridge stores lot {_aff['lot']} ({_aff['doses']} doses) "
                f"that feeds stock already under pressure: {_prob_txt} for "
                f"{_aff['drug_name']}."
            )
            with st.container(key="link_bridge_fridge"):
                if st.button("View impact on shortages",
                             key="btn_bridge_fridge"):
                    st.session_state["forecast_focus"] = _atc
                    st.switch_page("views/03_shortage_forecast.py")

        # Tabs: temperature first, lots & actions second; the detail panel fits
        # on one screen without scrolling.
        tab_temp, tab_lots = st.tabs(["24h temperature", "Lots & actions"])

        with tab_temp:
            # 24h chart with tolerance bands -----------------------------------
            history = M.fridge_24h(selected["fridge_id"])
            df = pd.DataFrame(history)
            df["ts"] = pd.to_datetime(df["ts"])

            fig = go.Figure()

            # safe tolerance band 2-8 °C (green)
            fig.add_hrect(y0=TEMP_OK_LOW, y1=TEMP_OK_HIGH,
                          fillcolor="rgba(22, 163, 74, .06)", line_width=0)
            # watch band 8-10 °C (amber)
            fig.add_hrect(y0=TEMP_OK_HIGH, y1=10,
                          fillcolor="rgba(180, 83, 9, .08)", line_width=0)
            # critical band >10 °C (red)
            fig.add_hrect(y0=10, y1=TEMP_CRIT_HIGH + 1,
                          fillcolor="rgba(220, 38, 38, .07)", line_width=0)

            # Threshold lines
            for y, color, dash in [
                (TEMP_OK_LOW, TOK.text_tertiary, "dot"),
                (TEMP_OK_HIGH, TOK.warn, "dash"),
                (10, TOK.crit, "dash"),
            ]:
                fig.add_hline(y=y, line_dash=dash, line_color=color,
                              line_width=1, opacity=0.7)

            fig.add_trace(go.Scatter(
                x=df["ts"], y=df["temp"],
                mode="lines",
                line=dict(color=TOK.brand, width=2),
                fill="tozeroy",
                fillcolor="rgba(15, 118, 110, .06)",
                hovertemplate="%{x|%H:%M}<br><b>%{y:.2f} °C</b><extra></extra>",
                name="Temperature",
            ))

            fig.update_layout(
                height=320,
                margin=dict(l=10, r=10, t=20, b=20),
                font=dict(family=TOK.font_family, color=TOK.text_secondary, size=11),
                plot_bgcolor="#FFFFFF",
                paper_bgcolor="rgba(0,0,0,0)",
                showlegend=False,
                yaxis=dict(title="°C", gridcolor=TOK.divider,
                           zerolinecolor=TOK.divider, range=[0, 13]),
                xaxis=dict(gridcolor=TOK.divider),
                hovermode="x unified",
            )
            st.plotly_chart(fig, use_container_width=True,
                            config={"displayModeBar": False})

            # mini-stats line: plain text, no dense blocks.
            vals = df["temp"].astype(float)
            min_v, max_v, mean_v = vals.min(), vals.max(), vals.mean()
            excursion_minutes = int((vals > TEMP_OK_HIGH).sum() * 5)

            _max_color = ("var(--ms-crit)" if max_v > TEMP_OK_HIGH
                          else "var(--ms-text)")
            _exc_color = ("var(--ms-crit)" if excursion_minutes
                          else "var(--ms-ok)")
            _max_note = (f' <span style="color:var(--ms-crit);font-size:.78rem;">'
                         f'(+{max_v - TEMP_OK_HIGH:.1f} above threshold)</span>'
                         if max_v > TEMP_OK_HIGH else "")
            st.markdown(
                f"""
                <div style="display:flex;gap:2.4rem;flex-wrap:wrap;
                            margin:.6rem 0 .2rem;font-size:.9rem;">
                  <div><span style="color:var(--ms-text-3);font-size:.72rem;
                       text-transform:uppercase;letter-spacing:.05em;
                       font-weight:700;">Min (24h)</span><br/>
                       <b>{min_v:.1f} °C</b></div>
                  <div><span style="color:var(--ms-text-3);font-size:.72rem;
                       text-transform:uppercase;letter-spacing:.05em;
                       font-weight:700;">Max (24h)</span><br/>
                       <b style="color:{_max_color};">{max_v:.1f} °C</b>{_max_note}</div>
                  <div><span style="color:var(--ms-text-3);font-size:.72rem;
                       text-transform:uppercase;letter-spacing:.05em;
                       font-weight:700;">Mean</span><br/>
                       <b>{mean_v:.1f} °C</b></div>
                  <div><span style="color:var(--ms-text-3);font-size:.72rem;
                       text-transform:uppercase;letter-spacing:.05em;
                       font-weight:700;">Out of range</span><br/>
                       <b style="color:{_exc_color};">{excursion_minutes} min</b></div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        with tab_lots:
            # Affected lots ---------------------------------------------------
            lots_df = pd.DataFrame([
                {"Lot": f"LOT-{selected['fridge_id']}-{i:03d}",
                 "Medication": d[0],
                 "ATC": d[1],
                 "Doses": (selected["lots"] * 47) // (i + 1),
                 "Exp.": f"2027-{((i * 3) % 11) + 1:02d}-15"}
                for i, d in enumerate(M.DRUGS[: min(selected["lots"], 4)])
            ])
            st.dataframe(lots_df, hide_index=True, use_container_width=True)

            # Actions ----------------------------------------------------------
            a1, a2 = st.columns(2)
            with a1:
                if st.button("Quarantine the lot",
                             use_container_width=True, type="primary",
                             disabled=sel_state == "ok"):
                    st.toast(f"Lots from {selected['fridge_id']} marked as suspect.")
            with a2:
                if st.button("Prepare a substitution brief",
                             use_container_width=True):
                    st.session_state["copilot_drug"] = M.DRUGS[0][0]
                    st.switch_page("views/04_clinical_copilot.py")
