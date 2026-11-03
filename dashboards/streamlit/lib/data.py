"""Aiguillage de la source de données : mock (démo) ou stack live.

C'est le SEUL endroit où l'app choisit qui remplit le contrat de données.
Les pages importent ``from lib.data import M`` et ne savent pas (et n'ont
pas à savoir) si ``M`` est le mock ou la vraie stack.

Règles
------
* ``USE_MOCK_DATA=false`` (défaut, .env) utilise ``live_data`` : requêtes
  TimescaleDB réelles, sorties du pipeline seedé par db-init.
* ``USE_MOCK_DATA=true`` utilise le mock : démo reproductible hors stack.
  Chaque fonction live retombe individuellement sur le mock (bascule
  loggée) si la base est injoignable : la démo ne casse jamais.

``data_mode()`` dit honnêtement à l'UI ce qui est réellement servi
(le chip du sidebar l'affiche).
"""
from __future__ import annotations

from . import mock_data
from .settings import get_settings

_settings = get_settings()

if _settings.use_mock_data:
    M = mock_data
else:
    # Réexport volontaire : M est le contrat consommé par toutes les pages.
    from . import live_data as M  # noqa: F401  # type: ignore[no-redef]


def data_mode() -> dict:
    """Mode réellement actif, pour le chip de statut du sidebar.

    Retourne ``{"mode": ..., "label": ..., "note": ...}`` avec mode ∈
    ``demo`` | ``live`` | ``fallback``.
    """
    if _settings.use_mock_data:
        return {
            "mode": "demo",
            "label": "India view",
            "okline": "Illustrative India records; CDSCO/NPPA feeds are not integrated",
            "note": "No patient data. Locations and inventory are illustrative, not live records.",
        }
    from . import live_data
    if live_data.ping():
        return {
            "mode": "live",
            "label": "Live stack (simulated telemetry)",
            "okline": "International reference feeds: FDA / ANSM / NHS; no India-specific shortage feed",
            "note": "Telemetry and inventory are simulated. New databases use Indian demo locations; "
                    "existing database records are left unchanged. No patient data.",
        }
    return {
        "mode": "fallback",
        "label": "Stack unreachable: demo fallback",
        "okline": "",
        "note": "The database is not responding: simulated data is being served in fallback mode. "
                "No patient data. Start the stack (docker compose up).",
    }
