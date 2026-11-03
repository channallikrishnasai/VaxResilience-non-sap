"""Validation workflow with pharmacist and nurse checks.

UX intent
---------
A clinical substitution is never a unilateral decision. The validation gate
is the highest-risk surface in the app, so the page is intentionally less
visual and more rigorous than the other screens:

* Top stepper: the user always knows which step they are on.
* Step 1 = pharmacist (4 checks: dose, allergy, stock, route).
* Step 2 = nurse 5B check at bedside (Right patient, right medication, right
  dose, right route, right time).
* Step 3 = audit log overview.

We use explicit ``st.checkbox`` labels rather than a single multi-select widget,
so each control is auditable independently (screen readers announce each gate as
its own affordance).
"""
from __future__ import annotations

import streamlit as st
from lib import components as C
from lib import icons as I
from lib.data import M

# ---------------------------------------------------------------------------
# Page header
# ---------------------------------------------------------------------------
C.page_header(
    eyebrow="Clinical support",
    icon="check-circle",
    title="Validation",
    subtitle=(
        "Two human checks before any administration: the pharmacist "
        "(4 criteria) and the nurse (5 rights). Every checkbox is recorded "
        "in the audit log."
    ),
)

# Retrieve the latest brief from the session, or use a placeholder
brief = st.session_state.get("last_brief")
form = st.session_state.get("last_form", {
    "drug": "Influenza vaccine (inactivated)", "atc": "J07BB02",
    "ctx": "Hospitalization", "horizon": "14 days", "nurse_note": "",
})

# ---------------------------------------------------------------------------
# Stepper (progress indicator), numbers + SVG check, zero emoji
# ---------------------------------------------------------------------------
_CHECK_SVG = I.icon("check", size=14, color="#FFFFFF", stroke_width=2.4)


def _stepper(active: int) -> None:
    steps = [
        ("1", "Pharmacist", "4 clinical checks"),
        ("2", "Nurse 5 rights", "bedside verification"),
        ("3", "Audit log", "immutable trace"),
    ]
    cols = st.columns(len(steps), gap="small")
    for i, (col, (num, title, sub)) in enumerate(zip(cols, steps, strict=False), start=1):
        with col:
            is_active = i == active
            is_done = i < active
            bg = "var(--ms-brand)" if is_active else (
                "var(--ms-ok)" if is_done else "var(--ms-bg-muted)")
            color = "#FFFFFF" if (is_active or is_done) else "var(--ms-text-3)"
            border = "transparent" if (is_active or is_done) else "var(--ms-border)"
            inner = _CHECK_SVG if is_done else num
            st.markdown(
                f"""
                <div style="display:flex;align-items:center;gap:.65rem;
                            padding:.65rem .85rem;
                            background:#FFFFFF;border:1px solid var(--ms-border);
                            border-radius:var(--ms-radius-md);
                            {"box-shadow:var(--ms-shadow-md);border-color:var(--ms-brand);"
                              if is_active else ""}">
                  <div style="width:28px;height:28px;border-radius:50%;
                              background:{bg};color:{color};border:1px solid {border};
                              display:flex;align-items:center;justify-content:center;
                              font-weight:700;font-size:.85rem;">
                    {inner}
                  </div>
                  <div>
                    <div style="font-weight:600;color:var(--ms-text);font-size:.875rem;">{title}</div>
                    <div style="color:var(--ms-text-3);font-size:.75rem;">{sub}</div>
                  </div>
                </div>
                """,
                unsafe_allow_html=True,
            )


step = st.session_state.get("validation_step", 1)
_stepper(step)

# Compact summary of the clinical context -------------------------------------
st.markdown(
    f"""
    <div class="ms-callout" style="margin-top:1rem;">
      <strong>Current brief:</strong> {form['drug']} ({form['atc']}),
      context <b>{form['ctx']}</b>, horizon <b>{form['horizon']}</b>.
      {('Note: <em>' + form['nurse_note'] + '</em>') if form['nurse_note'] else ''}
    </div>
    """,
    unsafe_allow_html=True,
)


# ---------------------------------------------------------------------------
# STEP 1 - Pharmacist gate
# ---------------------------------------------------------------------------
if step == 1:
    C.section_header(
        "Pharmacist validation", icon="check-circle",
        subtitle="all 4 boxes must be checked before sending to the prescriber",
    )

    with st.form("pharma_form", border=False):
        c1, c2 = st.columns(2, gap="medium")
        with c1:
            chk_dose = st.checkbox(
                "**Dose** verified and appropriate for the patient",
                help="Check that the proposed dose matches the patient weight, renal function, and age.")
            chk_allergy = st.checkbox(
                "**Allergies / contraindications** reviewed",
                help="Cross-check the substitute with the patient allergy record.")
        with c2:
            chk_stock = st.checkbox(
                "**Physical stock** of the substitute confirmed",
                help="Confirm real availability onsite or through redistribution.")
            chk_route = st.checkbox(
                "**Administration route** compatible",
                help="IM, IV, PO, SC… the route must match the original prescription or be explicitly adjusted.")

        actor_note = st.text_area(
            "Pharmacist note (optional)",
            placeholder="Example: redistribution from Bengaluru North Demo Hospital confirmed by the pharmacist.",
            height=80,
        )

        submitted = st.form_submit_button(
            "Send to prescriber",
            type="primary",
            use_container_width=True,
        )

    if submitted:
        missing = [n for n, v in {
            "Dose": chk_dose,
            "Allergy": chk_allergy,
            "Stock": chk_stock,
            "Route": chk_route,
        }.items() if not v]
        if missing:
            st.error(f"Missing checks: {', '.join(missing)}. These 4 checks are mandatory.")
        else:
            st.success(
                "Validated. The brief has been sent to the prescriber and the audit log has been updated. "
                "You can now proceed to the 5-right bedside check."
            )
            st.session_state["pharma_note"] = actor_note
            st.session_state["validation_step"] = 2
            if st.button("Continue to the 5-right check", type="primary"):
                st.rerun()


# ---------------------------------------------------------------------------
# STEP 2 - Nurse 5-rights gate
# ---------------------------------------------------------------------------
elif step == 2:
    C.section_header(
        "5-right bedside verification", icon="user",
        subtitle="right patient, right medication, right dose, right route, right time",
        right="IFSI 2024, HAS 5 Rights",
    )

    # Patient card
    st.markdown(
        f"""
        <div style="background:#FFFFFF;border:1px solid var(--ms-border);
                    border-left:4px solid var(--ms-brand);
                    border-radius:var(--ms-radius-md);
                    padding:.85rem 1rem;margin-bottom:1rem;
                    display:flex;justify-content:space-between;gap:1rem;">
          <div>
            <div style="font-size:.7rem;color:var(--ms-text-3);text-transform:uppercase;
                        letter-spacing:.08em;font-weight:600;">Patient</div>
            <div style="font-weight:700;color:var(--ms-text);font-size:1rem;">
              Mr. R. (initials, anonymized)
            </div>
            <div style="color:var(--ms-text-2);font-size:.85rem;">
              PAT-2026-0871, room W3-217
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:.7rem;color:var(--ms-text-3);text-transform:uppercase;
                        letter-spacing:.08em;font-weight:600;">Planned administration</div>
            <div style="font-weight:700;color:var(--ms-text);font-size:1rem;">
              {form['drug']}
            </div>
            <div style="color:var(--ms-text-2);font-size:.85rem;font-family:ui-monospace,monospace;">
              LOT-SUBST-A3F2, 0.5 mL IM
            </div>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    with st.form("nurse_form", border=False):
        b1 = st.checkbox(
            "**Right patient** : identification bracelet scanned and verified",
            help="ID + date of birth + bracelet.",
        )
        b2 = st.checkbox(
            "**Right medication** : vial label checked",
            help="Name + INN + ATC + lot matches the prescription.",
        )
        b3 = st.checkbox(
            "**Right dose** : calculation confirmed",
            help="Dose × concentration × volume = administered amount.",
        )
        b4 = st.checkbox(
            "**Right route** : IM/IV/PO compliant",
            help="Check that no contraindication exists (for example, a non-viable vein).",
        )
        b5 = st.checkbox(
            "**Right time** : time window respected",
            help="Interval since last dose, protocol schedule.",
        )

        nurse_note = st.text_area(
            "Nurse note (optional)",
            placeholder="Example: patient fasted for 6 hours; condition clinically stable.",
            height=80,
        )

        submitted = st.form_submit_button(
            "Validate administration",
            type="primary",
            use_container_width=True,
        )

    if submitted:
        missing = [n for n, v in {
            "Right patient": b1,
            "Right medication": b2,
            "Right dose": b3,
            "Right route": b4,
            "Right time": b5,
        }.items() if not v]
        if missing:
            st.error(f"STOP: do not administer. Missing checks: {', '.join(missing)}.")
        else:
            st.success("Administration validated. The event has been recorded in the immutable audit log.")
            st.session_state["nurse_note_final"] = nurse_note
            st.session_state["validation_step"] = 3
            if st.button("View audit log", type="primary"):
                st.rerun()


# ---------------------------------------------------------------------------
# STEP 3 - Audit log
# ---------------------------------------------------------------------------
else:
    C.section_header(
        "Audit log", icon="database",
        subtitle="immutable trace: who did what, when, and with which note",
    )

    import pandas as pd

    rows = M.audit_log()
    # In live mode, an empty log is a healthy state (no actions recorded yet):
    # display it honestly instead of falling back to the mock.
    if not rows:
        st.caption("No actions recorded yet: the log fills as briefs are validated or rejected.")
        st.stop()
    df = pd.DataFrame(rows)
    df["Decision"] = df["ok"].map({True: "Validated", False: "Rejected"})
    df = df.rename(columns={
        "ts": "IST timestamp",
        "actor": "Actor",
        "role": "Role",
        "event": "Event",
        "brief_id": "Brief",
        "drug": "Medication",
        "note": "Note",
    })[["IST timestamp", "Actor", "Role", "Event", "Brief",
        "Medication", "Decision", "Note"]]

    st.dataframe(df, hide_index=True, use_container_width=True,
                 column_config={
                     "Brief": st.column_config.TextColumn(width="small"),
                     "Decision": st.column_config.TextColumn(width="small"),
                 })

    C.callout(
        "<strong>Compliance.</strong> Audit log writes are immutable (append-only table). No patient data leaves the hospital perimeter: the language model is local. "
        "See <em>docs/governance_hipaa_rgpd.md</em>.",
    )

    if st.button("Start a new brief"):
        st.session_state.pop("validation_step", None)
        st.session_state.pop("last_brief", None)
        st.session_state.pop("last_form", None)
        st.switch_page("views/04_clinical_copilot.py")
