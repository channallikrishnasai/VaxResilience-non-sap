# Seed clinical protocols

These Markdown files are synthetic demo fixtures used by the RAG indexer
when no verified local corpus is available. They are NOT actual CDSCO
documents, product labels, or hospital protocols, and must not be used
for clinical decisions. They use an India-focused demo context only.

CDSCO does not currently have an automated shortage/document feed wired
into this project. For a real deployment, obtain current, authorized
Indian product information and institution-approved protocols, validate
them with qualified clinical and regulatory reviewers, then place the
approved corpus under `protocols/raw/` and re-run `make index-rag`.
