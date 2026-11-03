"""Logique LLM synchrone : adaptée au modèle d'exécution Streamlit.

On conserve la structure SBAR (Situation / Background / Assessment /
Recommendation) de la version FastAPI, mais le streamer est réécrit en
générateur *synchrone* pour s'insérer directement dans ``st.write_stream``.

Streamlit réexécute tout le script à chaque interaction ; bloquer sur un
générateur est la façon idiomatique de diffuser les tokens. Pas de
plomberie SSE nécessaire.

Le chemin live appelle toujours Ollama pour les utilisateurs qui veulent
un vrai LLM ; le chemin mock émet les trois cas pré-enregistrés utilisés
dans la version FastAPI, à une cadence réaliste pour que l'UX de streaming
soit testable hors ligne.
"""
from __future__ import annotations

import random
import time
from collections.abc import Iterator
from dataclasses import dataclass, field
from datetime import UTC, datetime

try:
    import httpx  # optional: only needed for the live Ollama path
except ImportError:  # pragma: no cover
    httpx = None  # type: ignore

from .settings import get_settings


# ---------------------------------------------------------------------------
# Modèle de données
# ---------------------------------------------------------------------------
@dataclass
class Citation:
    document: str
    page: int | str
    quote: str
    score: float | None = None


@dataclass
class Alternative:
    name: str
    atc_code: str
    dosing: str
    caveats: str


@dataclass
class Redistribution:
    site_name: str
    stock: int
    distance_km: int


@dataclass
class SBARBrief:
    drug_name:      str
    situation:      str
    background:     str
    assessment:     str
    recommendation: str

    alternatives:   list[Alternative]    = field(default_factory=list)
    citations:      list[Citation]       = field(default_factory=list)
    redistribution: list[Redistribution] = field(default_factory=list)

    model:        str       = ""
    generated_at: datetime  = field(default_factory=lambda: datetime.now(UTC))


# ---------------------------------------------------------------------------
# Corpus mock : trois scénarios de substitution réalistes
# ---------------------------------------------------------------------------
_MOCK_CORPUS: dict[str, dict] = {
    "vaccine": dict(
        situation=(
            "BREAKAGE_RISK F-04-01 (Mysuru Demo Hospital): outbound from the 2-8 °C zone for "
            "72 minutes, peaking at 9.4 °C. Lot VAX-2026-0142 (640 doses) may be compromised."
        ),
        background=(
            "Inactivated influenza vaccine, ATC J07BB02. This is an illustrative India "
            "shortage signal, not a live Indian feed or product-specific recommendation."
        ),
        assessment=(
            "No verified Indian product document is attached to this illustrative record. "
            "The lot status cannot be established from these records; quarantine pending "
            "review under the institution's approved protocol."
        ),
        recommendation=(
            "1) Keep VAX-2026-0142 quarantined pending pharmacist review. "
            "2) Verify the excursion against the product's CDSCO-approved information "
            "and the institution's validated cold-chain procedure. "
            "3) Use only an institution-approved redistribution or substitution process. "
            "4) This demo does not determine whether the lot is safe to use."
        ),
        alternatives=[
            Alternative("Inactivated influenza vaccine", "J07BB02",
                        "Consult the CDSCO-approved product information.",
                        "Illustrative entry; clinician review required."),
            Alternative("Alternative influenza vaccine formulation", "J07BB02",
                        "Consult the CDSCO-approved product information.",
                        "Illustrative entry; verify formulation and indication."),
        ],
        citations=[
            Citation("India_demo_vaccine_context.md", 1,
                     "Illustrative scenario only; no verified Indian product document attached.", 0.91),
            Citation("India_demo_cold_chain_context.md", 1,
                     "Follow the institution's validated procedure; demo data cannot establish product safety.", 0.84),
            Citation("Institutional_protocol_required.md", 1,
                     "Placeholder for a locally approved protocol; not a real clinical document.", 0.78),
        ],
        redistribution=[
            Redistribution("Bengaluru North Demo Hospital", 420, 8),
            Redistribution("Bengaluru South Demo Hospital", 180, 9),
        ],
    ),
    "insulin": dict(
        situation=(
            "Glargine insulin stock at J-7 at Bengaluru North Demo Hospital "
            "(320 units remaining). 14-day stockout probability: 61%."
        ),
        background=(
            "Illustrative inventory scenario involving basal insulin. No verified "
            "Indian product information is attached to this demo record."
        ),
        assessment=(
            "Illustrative 14-day shortage scenario. No verified Indian "
            "product information or institution-approved substitution protocol; "
            "a qualified clinician must determine any treatment decision."
        ),
        recommendation=(
            "1) Review the local inventory and the applicable CDSCO-approved product information. "
            "2) Do not use this forecast to change a patient's treatment. "
            "3) Consult the institution's approved diabetes protocol and pharmacist. "
            "4) A qualified prescriber must make and validate any treatment decision."
        ),
        alternatives=[
            Alternative("Insulin detemir", "A10AE05",
                        "Consult the CDSCO-approved product information.",
                        "Illustrative entry; clinician review required."),
            Alternative("Insulin degludec", "A10AE06",
                        "Consult the CDSCO-approved product information.",
                        "Illustrative entry; clinician review required."),
        ],
        citations=[
            Citation("India_demo_insulin_context.md", 1,
                     "Illustrative scenario; verify against current Indian product information.", 0.93),
            Citation("Institutional_protocol_required.md", 1,
                     "A locally approved protocol is required; this is not dosing guidance.", 0.88),
        ],
        redistribution=[Redistribution("Bengaluru Central Demo Hospital", 96, 8)],
    ),
    "antibiotic": dict(
        situation=(
            "Illustrative India shortage scenario for amoxicillin/clavulanate (J01CR02). "
            "Stock at Hyderabad Demo Hospital is 1,450 units; projected stockout at day +23."
        ),
        background=(
            "Illustrative inventory scenario for a beta-lactam and beta-lactamase inhibitor. "
            "No treatment indication or local shortage status is asserted."
        ),
        assessment=(
            "Illustrative inventory warning only. No verified Indian shortage notice or "
            "institution-approved antimicrobial protocol is attached to this demo record."
        ),
        recommendation=(
            "1) Confirm inventory with the pharmacy team. "
            "2) Do not use this forecast to change antibiotic treatment. "
            "3) Follow the institution's antimicrobial stewardship protocol and current "
            "CDSCO-approved product information. "
            "4) A qualified prescriber must validate any treatment decision."
        ),
        alternatives=[
            Alternative("Amoxicillin/clavulanate", "J01CR02",
                        "Consult the CDSCO-approved product information.",
                        "Illustrative entry; clinician review required."),
            Alternative("Cefuroxime", "J01DC02",
                        "Consult the CDSCO-approved product information.",
                        "Illustrative entry; clinician review required."),
        ],
        citations=[
            Citation("India_demo_antibiotic_context.md", 1,
                     "Illustrative inventory scenario; not an Indian shortage notice.", 0.86),
            Citation("Institutional_protocol_required.md", 1,
                     "A locally approved antimicrobial protocol is required.", 0.79),
        ],
        redistribution=[Redistribution("Bengaluru Central Demo Hospital", 240, 560)],
    ),
}


def _pick_corpus(drug_name: str) -> dict:
    n = (drug_name or "").lower()
    if any(k in n for k in ("vac", "flu", "influ", "mmr")):
        return _MOCK_CORPUS["vaccine"]
    if any(k in n for k in ("insulin", "glargine", "detemir")):
        return _MOCK_CORPUS["insulin"]
    if any(k in n for k in ("amox", "ceftri", "antib", "clav")):
        return _MOCK_CORPUS["antibiotic"]
    return _MOCK_CORPUS[random.Random(n).choice(list(_MOCK_CORPUS.keys()))]


def build_brief(drug_name: str) -> SBARBrief:
    """Retourne le brief structuré (non streamé) : utilisé pour rendre les
    panneaux alternatives / citations / redistribution.

    ``USE_LLM_MOCK=false`` emprunte le vrai chemin RAG (ChromaDB + Ollama +
    validation d'ancrage, llm/rag/brief.py) ; toute erreur retombe sur le
    corpus mock, en loggant la bascule : la démo ne casse jamais.
    """
    s = get_settings()
    if not s.use_llm_mock:
        try:
            return _build_brief_live(drug_name)
        except Exception as exc:
            import logging
            logging.getLogger("vigistock.llm").warning(
                "brief RAG live indisponible pour %s, repli mock : %s",
                drug_name, exc,
            )
    c = _pick_corpus(drug_name)
    return SBARBrief(
        drug_name=drug_name,
        situation=c["situation"],
        background=c["background"],
        assessment=c["assessment"],
        recommendation=c["recommendation"],
        alternatives=c["alternatives"],
        citations=c["citations"],
        redistribution=c["redistribution"],
        model=s.ollama_model + " (mock)",
    )


def _build_brief_live(drug_name: str) -> SBARBrief:
    """Chemin RAG réel : contexte tiré du pipeline, génération par
    llm/rag/brief.generate_substitution_brief, mapping vers le format SBAR.

    Le contexte (lot affecté, site, jours avant rupture) provient des mêmes
    fonctions live que le reste du dashboard : le brief parle des MÊMES
    excursions et des MÊMES stocks que les pages Overview et Prévision.
    """
    import uuid as _uuid

    from llm.rag.brief import generate_substitution_brief

    from . import live_data

    # 1. Contexte : lot affecté par une excursion en cours pour ce médicament.
    affected = live_data.excursion_affected_drugs()
    entry = next(
        ((atc, a) for atc, a in affected.items()
         if a["drug_name"].lower() == (drug_name or "").lower()),
        None,
    )
    if entry is None:
        raise ValueError(f"aucune excursion en cours n'affecte {drug_name!r}")
    atc, aff = entry

    overview = live_data.shortage_overview()
    fc = next((d for d in overview if d["atc_code"] == atc), None)
    days_left = fc["horizon_days"] if fc else 30
    severity = "BREAKAGE_RISK"

    brief = generate_substitution_brief(
        alert_id=f"ui-{_uuid.uuid4().hex[:12]}",
        drug_id=atc,
        drug_name=drug_name,
        site_id=_site_id_of(aff["site"]),
        site_name=aff["site"],
        lot_id=aff["lot"],
        suspect_doses=aff["doses"],
        days_to_stockout=days_left,
        severity=severity,
    )

    # 2. Mapping Brief (validé, llm/rag/validator) vers SBARBrief (contrat UI).
    s = get_settings()
    alternatives = [
        Alternative(
            name=a.name, atc_code=a.atc,
            dosing=a.posology_note or "se référer au protocole cité",
            caveats="; ".join(f"{c.doc} p.{c.page}" for c in a.citations)
                    or "voir protocole source",
        )
        for a in brief.alternatives
    ]
    citations = [
        Citation(document=c.doc, page=c.page,
                 quote="citation ancrée dans le protocole indexé", score=None)
        for a in brief.alternatives for c in a.citations
    ]
    redistribution = [
        Redistribution(
            site_name=_site_name_of(r.site),
            stock=r.surplus_doses,
            distance_km=_distance_km(_site_id_of(aff["site"]), r.site),
        )
        for r in brief.redistribution_candidates
    ]

    prob_txt = (f"probabilité de rupture {int(fc['shortage_prob'] * 100)} % "
                f"sous {days_left} j" if fc else "stock sous tension")
    return SBARBrief(
        drug_name=drug_name,
        situation=(f"{severity} sur {aff['fridge']} ({aff['site']}) : lot "
                   f"{aff['lot']} ({aff['doses']} doses) potentiellement compromis."),
        background=f"{drug_name}, ATC {atc}. Signaux pénurie : {prob_txt}.",
        assessment=brief.reasoning_brief
        or "Contexte documentaire insuffisant : décision au prescripteur.",
        recommendation=(
            "Quarantaine du lot, demande de redistribution prioritaire, "
            "substitution intra-classe selon les alternatives ci-dessous. "
            f"Confiance modèle : {brief.confidence}."
        ),
        alternatives=alternatives,
        citations=citations,
        redistribution=redistribution,
        model=s.ollama_model,
    )


def _site_id_of(site_name: str) -> str:
    """site_name vers site_id via le référentiel (repli : le nom lui-même)."""
    from .live_data import _query
    rows = _query("SELECT site_id FROM silver.dim_sites WHERE site_name = %s",
                  (site_name,))
    return rows[0]["site_id"] if rows else site_name


def _site_name_of(site_id: str) -> str:
    from .live_data import _query
    rows = _query("SELECT site_name FROM silver.dim_sites WHERE site_id = %s",
                  (site_id,))
    return rows[0]["site_name"] if rows else site_id


def _distance_km(site_a: str, site_b: str) -> int:
    """Distance haversine entre deux sites du référentiel (0 si inconnue)."""
    import math

    from .live_data import _query
    rows = _query(
        "SELECT site_id, latitude, longitude FROM silver.dim_sites "
        "WHERE site_id IN (%s, %s)", (site_a, site_b),
    )
    coords = {r["site_id"]: (r["latitude"], r["longitude"]) for r in rows}
    if len(coords) < 2 or any(v[0] is None for v in coords.values()):
        return 0
    (la1, lo1), (la2, lo2) = coords[site_a], coords[site_b]
    rla1, rla2 = math.radians(la1), math.radians(la2)
    dla, dlo = math.radians(la2 - la1), math.radians(lo2 - lo1)
    h = math.sin(dla / 2) ** 2 + math.cos(rla1) * math.cos(rla2) * math.sin(dlo / 2) ** 2
    return round(6371 * 2 * math.asin(math.sqrt(h)))


# ---------------------------------------------------------------------------
# Flux synchrone : consommé directement par st.write_stream(...)
# ---------------------------------------------------------------------------
def stream_sbar_text(brief: SBARBrief, *, tps: float = 40.0) -> Iterator[str]:
    """Émet le brief SBAR mot par mot sous forme d'un flux de texte unique.

    Les sections sont séparées par une petite ligne d'en-tête pour que le
    lecteur puisse parcourir la Situation pendant que le reste est encore
    en cours de streaming.
    """
    delay = 1.0 / tps
    for tag, body in [
        ("SITUATION",      brief.situation),
        ("BACKGROUND",     brief.background),
        ("ASSESSMENT",     brief.assessment),
        ("RECOMMENDATION", brief.recommendation),
    ]:
        yield f"\n\n**{tag}**  \n"
        for w in body.split():
            yield w + " "
            time.sleep(delay)


# ---------------------------------------------------------------------------
# Sondes de santé : synchrones
# ---------------------------------------------------------------------------
def ollama_health() -> dict:
    s = get_settings()
    if s.use_llm_mock or httpx is None:
        return {"ok": True, "mode": "mock", "model": s.ollama_model, "latency_ms": 0}
    try:
        t0 = time.time()
        r = httpx.get(f"{s.ollama_host}/api/tags", timeout=2.0)
        r.raise_for_status()
        latency_ms = int((time.time() - t0) * 1000)
        models = [m["name"] for m in r.json().get("models", [])]
        return {"ok": s.ollama_model in models, "mode": "live",
                "model": s.ollama_model, "available": models,
                "latency_ms": latency_ms}
    except Exception as exc:
        return {"ok": False, "mode": "unreachable", "error": str(exc)}


def kafka_health() -> dict:
    s = get_settings()
    if s.use_llm_mock:
        return {"ok": True, "mode": "mock", "broker": "mock"}
    host, _, port = s.redpanda_brokers.partition(":")
    import socket
    try:
        with socket.create_connection((host, int(port or 9092)), timeout=1.5):
            return {"ok": True, "mode": "live", "broker": s.redpanda_brokers}
    except Exception as exc:
        return {"ok": False, "mode": "unreachable", "error": str(exc)}
