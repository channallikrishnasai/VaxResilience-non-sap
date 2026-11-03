"""Vigistock : Streamlit application entry point.

Architecture
------------
Pages are registered via ``st.navigation(..., position="hidden")`` and the
sidebar is constructed manually with ``st.page_link``.

* Native navigation does not support custom SVG icons or color-coded section labels.
* Pages stay declared in one place, grouped by audience (Operations, Clinical support,
  Data pipeline, Project) rather than file system order.
"""
from __future__ import annotations

import streamlit as st
from lib import icons as I
from lib import style
from lib.data import M
from lib.settings import get_settings

# ---------------------------------------------------------------------------
# 1) Page config : must be the very first Streamlit call.
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="VaxResilience",
    page_icon=":material/health_and_safety:",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        "Get help": "https://github.com/Lohana-l/vigistock",
        "Report a bug": "https://github.com/Lohana-l/vigistock/issues",
        "About": (
            "**VaxResilience** - Cold chain monitoring, medication shortage forecasting, "
            "and clinical decision support for hospital pharmacies. Portfolio project "
            "by Lohana Utim, Data Engineer and former nurse."
        ),
    },
)


# ---------------------------------------------------------------------------
# 2) Inject the design system
# ---------------------------------------------------------------------------
style.inject()

s = get_settings()


# ---------------------------------------------------------------------------
# 3) Page declarations: grouped by audience and user-facing labels.
# ---------------------------------------------------------------------------
NAV: list[dict] = [
    {
        "section": "Operations", "tone": "brand",
        "items": [
            {"key": "nav_overview",  "icon": "tower",
             "page": st.Page("views/01_overview.py",          title="Overview", default=True)},
            {"key": "nav_fridges",   "icon": "fridge",
             "page": st.Page("views/02_cold_chain.py",        title="Refrigerators")},
            {"key": "nav_forecast",  "icon": "forecast",
             "page": st.Page("views/03_shortage_forecast.py", title="Shortage forecast")},
        ],
    },
    {
        "section": "Clinical support", "tone": "brand",
        "items": [
            {"key": "nav_sbar",      "icon": "file-text",
             "page": st.Page("views/04_clinical_copilot.py",  title="SBAR brief")},
            {"key": "nav_valid",     "icon": "check-circle",
             "page": st.Page("views/05_validation.py",        title="Validation")},
        ],
    },
    {
        "section": "Data pipeline", "tone": "secondary",
        "items": [
            {"key": "nav_archi",     "icon": "pipeline",
             "page": st.Page("views/06_architecture.py",      title="Pipeline architecture")},
            {"key": "nav_quality",   "icon": "bar-chart",
             "page": st.Page("views/07_data_quality.py",      title="Data quality")},
        ],
    },
    {
        "section": "Project", "tone": "brand",
        "items": [
            {"key": "nav_about",     "icon": "info",
             "page": st.Page("views/08_about.py",             title="About / stack")},
        ],
    },
]

_ALL_PAGES = [it["page"] for grp in NAV for it in grp["items"]]
nav = st.navigation(_ALL_PAGES, position="hidden")


# ---------------------------------------------------------------------------
# 4) CSS per nav item: SVG icon as mask + active state.
#    (Generated here because keys and icons are declared above.)
# ---------------------------------------------------------------------------
def _nav_css() -> str:
    rules: list[str] = []
    for grp in NAV:
        for it in grp["items"]:
            rules.append(
                f'.st-key-{it["key"]} [data-testid="stPageLink-NavLink"]::before {{'
                f'-webkit-mask-image: {I.css_mask(it["icon"])};'
                f'mask-image: {I.css_mask(it["icon"])};}}'
            )
    return "<style>" + "".join(rules) + "</style>"


st.markdown(_nav_css(), unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# 5) Sidebar: branding at the top, navigation in the middle, system status at the bottom.
# ---------------------------------------------------------------------------
with st.sidebar:
    # Top: full logo + name + summary status
    _fleet = M.fleet_snapshot()
    _n_sites = len({f["site"] for f in _fleet})
    st.markdown(
        f"""
        <div class="ms-sidebrand">
          {I.logo(40)}
          <div>
            <div class="name">VaxResilience</div>
            <div class="status">
              <span class="dot"></span> Active monitoring: {_n_sites} sites, {len(_fleet)} fridges
            </div>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Navigation grouped by audience
    for grp in NAV:
        tone_cls = "ms-navlabel secondary" if grp["tone"] == "secondary" else "ms-navlabel"
        st.markdown(
            f'<div class="{tone_cls}">{grp["section"]}</div>',
            unsafe_allow_html=True,
        )
        for it in grp["items"]:
            with st.container(key=it["key"]):
                st.page_link(it["page"], label=it["page"].title)

    # Active state styling
    _active = next(
        (it["key"] for grp in NAV for it in grp["items"]
         if it["page"].title == nav.title),
        None,
    )
    if _active:
        st.markdown(
            f"<style>.st-key-{_active} {{}}"
            f".st-key-{_active} [data-testid='stPageLink-NavLink'] {{"
            f"background: var(--ms-brand-subtle); color: var(--ms-brand);"
            f"font-weight: 700;}}</style>",
            unsafe_allow_html=True,
        )

    # System status at the bottom
    from lib.data import data_mode
    _dm = data_mode()
    _chip_style = ("background:var(--ms-brand-subtle);"
                   "border-color:var(--ms-brand-border);"
                   "color:var(--ms-brand-hover);") if _dm["mode"] == "live" else ""
    _okline_html = (
        f'<div class="okline"><span class="dot"></span>{_dm["okline"]}</div>'
        if _dm.get("okline") else ""
    )
    st.markdown(
        f"""
        <div class="ms-sidefoot">
          <span class="ms-demo-chip" style="{_chip_style}">
            <span class="dot" style="{'background:var(--ms-ok);' if _dm['mode'] == 'live' else ''}"></span>
            {_dm['label']}
          </span>
          {_okline_html}
          <div class="note">{_dm['note']}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ---------------------------------------------------------------------------
# 6) Launch the selected page
# ---------------------------------------------------------------------------
nav.run()
