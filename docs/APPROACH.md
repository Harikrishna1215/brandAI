# Approach
**Brand voice analysis.** The model analyses tone, personality, audience, themes and style in priority order: explicit guidelines, selected tones, pasted reference posts, then products/industry/objective/audience, then inference. The response says whether the basis was reference posts, preferences, or pure inference; nothing is claimed as verified.

**Prompt engineering.** `prompt_builder.py` holds a fixed system prompt (rules, no invented facts, mix of categories, JSON schema) and passes all user content as a JSON data block, so it never becomes privileged instructions. Regeneration adds a variation note and a higher temperature.

**Validation.** Pydantic checks the schema (3-4 summary bullets), exactly 10 tweets, unique ids, non-empty text and near-duplicates (difflib >= 0.85). Character counts are computed in code, and tweets over 280 produce a warning. Invalid output gets one repair attempt, then a safe 502.

**Tools.** React, Vite, TypeScript, Tailwind, Lucide, FastAPI, Pydantic, httpx, OpenAI-compatible chat API, pytest, vitest.

**Testing.** Mocked-provider backend tests and frontend tests were executed (see completion report). **No live generation or two-brand evaluation has been run yet**, because no API key was available. Add real outputs here after running the UrbanVibe and Lumina Labs presets with a key.

**Limitations.** No live social retrieval; voice is inferred without reference posts.
