# Evaluation Dataset

## golden_questions.json

Version-controlled evaluation dataset for the AgriSense RAG system.

Contains 30 questions across:
- Language: English, Hindi, Hinglish
- Intent: eligibility, benefits, application_process, general_information, etc.
- Difficulty: easy, medium, hard
- Special: hallucination traps, multi-turn conversation scenarios

### Schema

See `rag/evaluation/models.py` → `EvalQuestion` for the full schema.

### Adding Questions

1. Add to `golden_questions.json`
2. Set a unique `id` (e.g. `q031`)
3. Only reference `expected_schemes` from the corpus
4. Run `python -m rag.evaluation --dataset rag/evaluation/data/golden_questions.json` to verify

### Corpus Schemes

- pm_kisan, pmfby, kcc, pmksy, soil_health_card
- agricultural_mechanization, agriculture_infrastructure_fund
- rkvy, uttar_pradesh
