# 📚 RAG Workflow — Agricultural Knowledge Engine
## End-to-End Implementation Guide (Retrieval-Augmented Generation)

**Scope:** This document covers **only the RAG / Agricultural Knowledge Engine** — the P1 roadmap upgrade from `Agriculture-MVP-Project-Schema.md` (Section 22.2). It is **not MVP scope** — build this only after the core prediction pipeline (see `Backend-Workflow.md`) is working end to end. This document assumes the core `/predict` pipeline already exists and is being extended, not replaced.

**Audience:** Whoever picks up P1 work after the MVP freeze — likely Member 1 (ML) or Member 4 (Backend), possibly a dedicated split if the team grows.

---

## 1. What This Adds, Restated

The MVP answers: *"Which crop is suitable, and what's its predicted yield?"*
RAG answers: *"Why — what agricultural knowledge supports this recommendation?"*

```
Farmer: "Why are you recommending maize?"
        ↓
ML prediction (already have: predicted yield, suitability score)
        +
Historical evidence (already have: stability, trend)
        +
Weather data (already have: current + forecast)
        +
Retrieved agricultural knowledge (NEW — this document)
        ↓
Grounded, cited answer — not a generic chatbot response
```

**Critical design rule carried over from the Schema doc:** RAG is a *grounding and explanation layer*, not a replacement for the deterministic explanation engine (Schema doc Section 16). The Suitability Score and ranking still come entirely from the ML model — RAG never influences the ranking, it only explains and supplements it with retrieved evidence. This keeps the core recommendation defensible and deterministic while making the *explanation* richer.

---

## 2. RAG Pipeline — High Level

```
                    OFFLINE (build once, refresh periodically)
Documents (ICAR, state agri univ, govt guidelines, crop calendars, etc.)
        ↓
   Collection & Cleaning
        ↓
   Chunking
        ↓
   Embedding
        ↓
   Vector DB (indexed, ready to query)

                    ONLINE (per farmer query)
Farmer Query ("Why maize?") or system-triggered explanation request
        ↓
   Query Embedding
        ↓
   Similarity Search against Vector DB
        ↓
   Top-K Relevant Chunks
        ↓
   Context Assembly (retrieved chunks + ML prediction + weather + historical data)
        ↓
   LLM Generation (grounded, with citations)
        ↓
   Grounded Answer returned to farmer
```

---

## 3. Tech Stack for RAG

| Component | Recommended Choice | Notes |
|---|---|---|
| Embedding model | `sentence-transformers` (e.g. `all-MiniLM-L6-v2`) for local/free, or an API embedding model if budget allows | Start local — no API cost, no rate limits, good enough for hackathon scale |
| Vector DB | **ChromaDB** (embedded, file-based) for MVP-of-RAG; Pinecone/Weaviate/Qdrant if the team wants a hosted option | ChromaDB needs zero infra — runs in-process, perfect for a hackathon timeline |
| LLM for generation | Whatever the team already has API access to (Claude, GPT, or an open model via Ollama) | Keep this swappable behind a thin `LLMClient` wrapper — same principle as `WeatherService` |
| Document parsing | `pypdf` / `unstructured` for PDFs, plain text loaders for `.txt`/`.md` | Government PDFs are often scanned — check for OCR needs early |
| Orchestration | Plain Python — LangChain/LlamaIndex are optional, not required at this scale | Don't add a heavy framework just for a few hundred chunks; keep it simple and explainable to judges |

**Principle:** every external dependency here (embedding model, vector DB, LLM) should be wrapped the same way `WeatherService` wraps the weather vendor (see `Backend-Workflow.md` Section 5.3) — swappable, testable in isolation, with a clear interface.

---

## 4. Knowledge Base — Sourcing and Curation

### 4.1 Source types (from Schema doc Section 22.2)
- Government agricultural guidelines
- ICAR (Indian Council of Agricultural Research) publications
- State agricultural university extension documents
- Crop cultivation guides
- Government scheme documents
- Soil/crop management documents
- Pest management guidelines
- Weather advisories
- Crop calendars
- Agricultural research papers (open-access only — respect licensing)

### 4.2 Curation workflow

```
1. Identify sources relevant to the LOCKED crops/districts (Schema doc Section 27 —
   don't collect generic global agriculture content, collect what matches your MVP scope)
        ↓
2. Download / collect documents into data/knowledge_raw/
        ↓
3. Tag each document with metadata BEFORE chunking:
       source_name, publisher, publication_date (if known), crop(s) covered,
       season(s) covered, region/state covered, document_type, license/usage rights
        ↓
4. Filter out anything without a clear, legitimate source — no scraped forum
   content, no unattributed blog posts (this matters both for RAG quality
   AND because it's the same content-safety principle as citation rules elsewhere)
        ↓
5. Store the curated list in a manifest file (knowledge_manifest.csv) so the
   whole team can see what's in the knowledge base without opening every document
```

**`knowledge_manifest.csv` columns:**
```
document_id, filename, source_name, publisher, crop, season, region, document_type, license_note, added_date
```

This directly maps to the `KnowledgeDocument` entity in the main schema (Section 28.11) — keep field names identical.

---

## 5. Folder Structure

```
rag/
│
├── ingestion/
│   ├── collect_documents.py        # organizes raw docs into data/knowledge_raw/
│   ├── parse_documents.py          # PDF/text extraction → clean plain text
│   ├── chunk_documents.py          # splits cleaned text into KnowledgeChunk units
│   └── build_index.py              # embeds chunks, writes to vector DB
│
├── retrieval/
│   ├── retriever.py                # KnowledgeRetriever — query embedding + similarity search
│   └── reranker.py                 # (optional) re-ranks top-K results before passing to LLM
│
├── generation/
│   ├── llm_client.py               # LLMClient — thin wrapper, swappable provider
│   ├── prompt_templates.py         # grounded-answer prompt templates
│   └── explanation_service.py      # ExplanationService — combines ML output + retrieval + LLM
│
├── data/
│   ├── knowledge_raw/               # original source documents
│   ├── knowledge_processed/         # cleaned, chunked text
│   └── knowledge_manifest.csv
│
├── vector_store/                   # ChromaDB persistent storage (if using local/embedded mode)
│
├── tests/
│   ├── test_chunking.py
│   ├── test_retriever.py
│   └── test_explanation_service.py
│
└── notebooks/
    ├── 01_document_collection.ipynb
    ├── 02_chunking_experiments.ipynb
    ├── 03_embedding_and_indexing.ipynb
    └── 04_retrieval_evaluation.ipynb
```

This sits alongside `backend/` as its own module — the FastAPI layer calls into `rag/` the same way it calls into `services/` for the core prediction pipeline (see Section 9 for the integration point).

---

## 6. Build Order

```
STEP 1   Curate and manifest the knowledge base (Section 4)
              ↓
STEP 2   Parse documents into clean plain text
              ↓
STEP 3   Chunk the text (Section 7)
              ↓
STEP 4   Embed chunks and build the vector index (Section 8)
              ↓
STEP 5   Build KnowledgeRetriever — test retrieval quality BEFORE adding an LLM (Section 9)
              ↓
STEP 6   Wrap an LLM client (Section 10)
              ↓
STEP 7   Build the grounded-answer prompt + ExplanationService (Section 11)
              ↓
STEP 8   Wire into FastAPI as new endpoints (Section 12)
              ↓
STEP 9   Evaluate retrieval + generation quality (Section 13)
              ↓
STEP 10  Integrate into the farmer-facing explanation flow
```

**Why retrieval is validated before generation (Step 5 before Step 6):** if retrieval returns irrelevant chunks, no amount of prompt engineering fixes the answer — you'd just be asking an LLM to hallucinate confidently on top of bad context. Get retrieval right first, in isolation, with a human eyeballing the results.

---

## 7. Chunking Workflow (Step 3, Detail)

### 7.1 Chunking strategy
```
Cleaned document text
        ↓
Split by semantic unit first (section headers, paragraphs) — NOT a fixed character count blindly
        ↓
Within each semantic unit, chunk to ~300–500 tokens with ~50-token overlap
        ↓
Attach metadata to EVERY chunk (inherited from the parent document):
    document_id, source_name, crop, season, region, chunk_index
```

### 7.2 Why overlap matters
A crop-suitability fact ("rice requires standing water during the first 30 days") can span a chunk boundary. A 50-token overlap between adjacent chunks reduces the chance that a fact gets split in a way that makes neither chunk retrievable on its own.

### 7.3 Chunk record shape
```python
class KnowledgeChunk(BaseModel):
    chunk_id: str
    document_id: str
    chunk_text: str
    source_name: str
    crop: str | None
    season: str | None
    region: str | None
    chunk_index: int
```

This mirrors `KnowledgeChunk` in the main schema (Section 28.11) exactly — keep names identical across both documents.

---

## 8. Embedding + Indexing Workflow (Step 4, Detail)

```
For each KnowledgeChunk:
        ↓
   embedding_vector = embedding_model.encode(chunk.chunk_text)
        ↓
   vector_db.add(
       id=chunk.chunk_id,
       embedding=embedding_vector,
       document=chunk.chunk_text,
       metadata={source_name, crop, season, region, document_id}
   )
```

**Definition of done:** running `build_index.py` on the curated knowledge base populates `vector_store/` and a smoke-test query (e.g. "rice water requirements") returns at least one clearly relevant chunk when inspected manually.

**Re-indexing:** treat this as a batch job, same principle as ML training (`Backend-Workflow.md` Section 7 — Offline vs Online). The vector index is built offline and loaded read-only by the running API — never rebuilt per-request.

---

## 9. Retrieval Workflow (Step 5, Detail)

```python
class KnowledgeRetriever:
    def retrieve(self, query: str, crop: str | None = None,
                 district: str | None = None, top_k: int = 5) -> list[KnowledgeChunk]:
        query_embedding = embedding_model.encode(query)
        results = vector_db.query(
            query_embedding,
            top_k=top_k,
            where=self._build_metadata_filter(crop, district)  # optional pre-filter
        )
        return [self._to_chunk(r) for r in results]
```

### 9.1 Metadata filtering vs pure similarity
When the system already knows the crop and district (because it's explaining an existing `Prediction`), **pre-filter by metadata first**, then rank by similarity within that filtered set. This avoids retrieving highly-similar-but-wrong-crop content (e.g. maize irrigation advice showing up when explaining a rice recommendation).

### 9.2 Retrieval evaluation checklist (do this manually before trusting it)
- [ ] Pick 10 realistic farmer questions ("why is rice recommended", "what rainfall does maize need")
- [ ] For each, run retrieval and manually check: are the top-3 chunks actually relevant?
- [ ] Check for a specific failure mode: does the retriever return chunks about a *different* crop with similar-sounding text? (This is what the metadata filter in 9.1 should prevent.)
- [ ] Record a simple hit-rate score (relevant chunks in top-3 / 10 questions) — doesn't need to be sophisticated, just needs to catch obviously broken retrieval before generation is built on top of it

---

## 10. LLM Client Wrapper (Step 6, Detail)

```python
class LLMClient:
    def generate(self, prompt: str, max_tokens: int = 500) -> str:
        # swap the implementation here without touching ExplanationService
        ...
```

Keep the provider swappable — same principle as `WeatherService`. This also means the team can prototype with one provider and switch before the final demo without touching any other code.

---

## 11. Grounded Answer Generation (Step 7, Detail)

### 11.1 Prompt template

```
SYSTEM:
You are an agricultural assistant. Answer the farmer's question using ONLY the
provided context (ML prediction data, historical evidence, weather data, and
retrieved agricultural knowledge). Do not invent information not present in
the context. If the context is insufficient, say so explicitly rather than
guessing. Cite which source each piece of supporting knowledge comes from.

CONTEXT:
--- ML Prediction ---
Crop: {crop}
Predicted yield: {predicted_yield_t_per_ha} t/ha
Suitability score: {suitability_score}/100
Historical stability: {historical_stability}
Weather compatibility: {weather_compatibility}

--- Historical Evidence ---
{historical_summary}

--- Current + Forecast Weather ---
{weather_summary}

--- Retrieved Agricultural Knowledge ---
[1] ({source_name_1}): {chunk_text_1}
[2] ({source_name_2}): {chunk_text_2}
[3] ({source_name_3}): {chunk_text_3}

FARMER QUESTION:
{farmer_query}

Answer in 2-4 sentences, plain language, and mention which retrieved source(s)
support your answer using [1]/[2]/[3] style references.
```

### 11.2 `ExplanationService` workflow

```
ExplanationService.explain(prediction_id, farmer_query)
        ↓
   1. Load the Prediction record (already computed by the core pipeline)
        ↓
   2. Call KnowledgeRetriever.retrieve(query=farmer_query, crop=prediction.crop,
                                         district=prediction.district, top_k=3)
        ↓
   3. Assemble the prompt (Section 11.1) with prediction + retrieved chunks
        ↓
   4. Call LLMClient.generate(prompt)
        ↓
   5. Return { answer_text, sources: [source_name for each cited chunk] }
```

**This keeps the ranking untouched.** `ExplanationService` is called *after* `RecommendationService` has already ranked candidates (`Backend-Workflow.md` Section 5.5) — RAG only ever explains an existing, already-computed recommendation. It never re-ranks or re-scores anything.

---

## 12. API Integration (Step 8, Detail)

New endpoints, additive to the core API spec (main schema doc Section 29.2):

| Method | Path | Purpose | Request | Response |
|---|---|---|---|---|
| POST | `/knowledge/search` | Raw retrieval, no LLM — useful for debugging/demoing retrieval alone | `{ query, crop?, district? }` | `[{ chunk_text, source_name, score }]` |
| POST | `/predictions/{prediction_id}/explain-grounded` | Full grounded explanation for an existing prediction | `{ farmer_query }` | `{ answer_text, sources: string[] }` |

```python
# api/knowledge.py
@router.post("/predictions/{prediction_id}/explain-grounded")
async def explain_grounded(prediction_id: str, request: ExplainRequest):
    prediction = get_prediction(prediction_id)  # existing lookup, from core pipeline
    result = explanation_service.explain(prediction, request.farmer_query)
    return result
```

**Naming note:** keep `/predictions/{prediction_id}/explain-grounded` distinct from the rule-based `/predictions/{prediction_id}/explain` (uncertainty/feature-importance endpoint from the main schema Section 29.3) — they answer different questions and should not be merged.

---

## 13. Evaluation Workflow (Step 9, Detail)

RAG quality has two failure surfaces — evaluate them separately.

### 13.1 Retrieval quality (already covered in Section 9.2)
Manual hit-rate check on a fixed set of test questions.

### 13.2 Generation quality — check for these specific failure modes
```
1. Hallucination check:
   Does the generated answer state anything NOT present in the retrieved
   chunks or the ML prediction data? → if yes, tighten the prompt
   ("use ONLY the provided context") or reduce max_tokens to discourage
   elaboration beyond the context.

2. Citation check:
   Does every factual claim in the answer trace back to a [1]/[2]/[3]
   reference? Spot-check 10 generated answers manually.

3. Irrelevant-context check:
   If retrieval returns weak/irrelevant chunks (Section 9.2), does the
   LLM correctly say "insufficient information" rather than making
   something up anyway? Test this deliberately with an off-topic query.

4. Consistency check:
   Does the grounded explanation ever contradict the deterministic
   explanation engine's output (main schema Section 16)? It shouldn't —
   both are explaining the same Prediction. If it does, the prompt
   context (Section 11.1) is likely missing or misrepresenting the
   ML prediction data.
```

---

## 14. RAG-Specific Checklist

- [ ] Knowledge base sources curated and manifested (Section 4), with license/usage rights recorded
- [ ] Documents parsed to clean text, chunked with overlap (Section 7)
- [ ] Chunk metadata (crop, season, region, source) attached to every chunk
- [ ] Vector index built and smoke-tested manually
- [ ] `KnowledgeRetriever` evaluated on ≥10 realistic questions with a recorded hit rate
- [ ] Metadata pre-filtering implemented to prevent cross-crop contamination (Section 9.1)
- [ ] `LLMClient` wrapped behind a swappable interface
- [ ] Grounded-answer prompt explicitly instructs "use only provided context" and to cite sources
- [ ] `ExplanationService` confirmed to never alter ranking/suitability_score — read-only over an existing `Prediction`
- [ ] Hallucination spot-check done on ≥10 generated answers
- [ ] `/knowledge/search` and `/predictions/{id}/explain-grounded` endpoints working and documented in `/docs`
- [ ] Fallback behavior defined: if retrieval returns nothing relevant, the answer explicitly says so rather than inventing agricultural advice

---

## 15. Common Failure Modes to Watch For (RAG-Specific)

| Symptom | Likely Cause | Fix |
|---|---|---|
| Retrieved chunks are about the wrong crop | No metadata pre-filtering, pure similarity search pulling in near-duplicate phrasing across crops | Add the metadata filter from Section 9.1 |
| LLM answer contradicts the ML prediction | Prompt doesn't clearly separate "ground truth from the model" vs "supporting knowledge" | Restructure the prompt (Section 11.1) so ML prediction data is presented as authoritative context, not just one more source |
| LLM invents a specific number (e.g. a rainfall figure) not in any chunk | Insufficient context + LLM filling gaps | Explicitly instruct "if a specific number isn't in the context, don't state one"; lower `max_tokens`; consider a stricter/smaller model for this task |
| Retrieval works in notebook but returns nothing via the API | Vector DB path not shared correctly between the offline indexing script and the running FastAPI process (e.g. relative path issue) | Use an absolute, configured path (`config.py`, same pattern as `model_artifact_path`) |
| Demo-day slowness | LLM call blocking the response, especially with a large `top_k` or verbose prompt | Cap `top_k` at 3-5, keep prompts concise, consider showing retrieval results immediately and streaming/async-loading the generated answer in the UI |
| Judges ask "how do you know it's not hallucinating" | No answer prepared | Have the citation mechanism (Section 11.1, `[1]/[2]/[3]`) visibly rendered in the UI — this is your answer: every claim traces to a shown source |
