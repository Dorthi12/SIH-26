# AgriSense RAG — Government Scheme Ingestion Pipeline

> **Scope:** Document ingestion only. Farmer chatbot / retrieval / generation layers are separate.

## What this does

Reads government scheme PDFs → extracts text → cleans → chunks semantically → generates multilingual embeddings (Sentence Transformers) → upserts to Pinecone.

## Package layout

```
rag/
├── config.py                     — all env-var driven configuration
├── requirements.txt              — Python deps
├── .env.example                  — copy to .env and fill in credentials
├── data/
│   └── ingestion_state.db        — SQLite re-ingestion tracker (auto-created)
└── ingestion/
    ├── discovery.py              — recursive PDF discovery + manifest lookup
    ├── extractor.py              — pypdf page extraction
    ├── cleaner.py                — text cleaning + header/footer detection
    ├── metadata.py               — metadata inference from path + manifest
    ├── chunker.py                — semantic section + sliding-window chunking
    ├── embedder.py               — Sentence Transformer wrapper (singleton)
    ├── pinecone_store.py         — Pinecone upsert + query layer
    ├── state_store.py            — SQLite hash tracking for re-ingestion safety
    ├── pipeline.py               — orchestrator + CLI
    ├── __main__.py               — entry point
    └── debug.py                  — smoke-test command
```

## Quick start

### 1. Install dependencies

```bash
cd /path/to/SIH-26
pip install -r rag/requirements.txt
```

### 2. Configure credentials

```bash
cp rag/.env.example rag/.env
# Edit rag/.env — fill in PINECONE_API_KEY and adjust index name if needed
```

### 3. Create your Pinecone index

In the [Pinecone console](https://app.pinecone.io/), create an index with:
- **Dimension:** `384`  (matches the default `paraphrase-multilingual-MiniLM-L12-v2`)
- **Metric:** `cosine`
- **Name:** matches `PINECONE_INDEX_NAME` in your `.env` (default: `agrisense-govschemes`)

If you change the embedding model, use the dimension that model reports.

### 4. Download the PDFs

```bash
cd frontend/agrisense_government_documents
bash download_sources.sh
```

Or download PDFs manually from the URLs in `sources_manifest.csv` and place them
in the matching sub-folders.

### 5. Test discovery and chunking (no Pinecone needed)

```bash
python -m rag.ingestion.pipeline --dry-run
```

### 6. Run the full pipeline

```bash
python -m rag.ingestion.pipeline
```

With a custom source directory:

```bash
python -m rag.ingestion.pipeline --source ./frontend/agrisense_government_documents
```

Force re-ingest all documents (ignore unchanged-hash check):

```bash
python -m rag.ingestion.pipeline --force
```

### 7. Smoke-test all 6 stages

```bash
# Checks 1-4 only (no Pinecone required):
python -m rag.ingestion.debug --skip-pinecone

# All 6 checks (Pinecone credentials required):
python -m rag.ingestion.debug
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `EMBEDDING_MODEL` | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | Sentence Transformer model name |
| `PINECONE_API_KEY` | *(required)* | Your Pinecone API key |
| `PINECONE_INDEX_NAME` | `agrisense-govschemes` | Pinecone index name |
| `PINECONE_NAMESPACE` | `government_schemes` | Pinecone namespace |
| `EMBEDDING_BATCH_SIZE` | `64` | Chunks per embedding batch |
| `PINECONE_UPSERT_BATCH_SIZE` | `100` | Vectors per Pinecone upsert batch |
| `CHUNK_TOKEN_SIZE` | `400` | Target chunk size (approximate tokens) |
| `CHUNK_OVERLAP_TOKENS` | `75` | Overlap between adjacent chunks |

## Re-ingestion safety

Running the pipeline multiple times is safe:

- File hashes are stored in `rag/data/ingestion_state.db` (SQLite).
- If a PDF hasn't changed, it's skipped automatically.
- If a PDF is updated, its chunks/vectors are replaced (deterministic chunk IDs via SHA-256).
- Use `--force` to bypass the hash check and re-ingest everything.

## Embedding model

The default model (`paraphrase-multilingual-MiniLM-L12-v2`) handles:
- English government guidelines
- Hindi scheme documents
- Hinglish mixed text
- 50+ other languages

It produces **384-dimensional** embeddings and runs efficiently on CPU.
The model is downloaded from Hugging Face on first use (~120 MB) and cached locally.

To use a different model, set `EMBEDDING_MODEL` in your `.env`.
If the dimension changes, update your Pinecone index accordingly.

## Metadata on every vector

Every Pinecone vector contains:

| Field | Source |
|---|---|
| `scheme_name` | directory slug → display name |
| `scheme_id` | directory name (e.g. `pmfby`) |
| `government_level` | first path segment (`central` / `state`) |
| `state` | second path segment for state-level docs |
| `document_title` | filename stem, cleaned |
| `document_type` | inferred from filename keywords |
| `section` | detected section heading |
| `page_number` | page where chunk begins |
| `language` | inferred from filename (`en` / `hi`) |
| `source_url` | from `sources_manifest.csv` |
| `source_type` | from `sources_manifest.csv` |
| `published_date` | year extracted from filename |
| `chunk_id` | deterministic SHA-256 |
| `chunk_text` | full chunk text (stored in metadata) |
