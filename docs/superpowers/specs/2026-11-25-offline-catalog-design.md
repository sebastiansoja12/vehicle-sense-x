# Offline make/model selection

User explicitly requested connecting the researched offline catalog and retaining manual entry. Earlier instructions authorize continuous implementation without repeated design approval. Work stays in the current checkout containing the existing uncommitted application; no commits, merges or publication are part of this change.

Use a pinned, hash-verified MeterApp vehicle-db snapshot, extracting passenger-car/MPV names only from NHTSA, UK DfT, EEA and RDW. Keep source notices and dates. Exclude other sources rather than inferring reuse rights. Generate a smaller bundled name list; no runtime requests, VIN uploads, package dependency or year/spec inference. Case/diacritic duplicates collapse, while punctuation distinguishing models (e.g. Golf+) stays distinct. Names must fit the existing 60/80 character make/model limits.

The vehicle form uses make and make-scoped model selectors with a search field and a bounded result list. Query text is separate from committed values. Choosing a different make clears the old model. Manual entry is always available; toggling modes preserves entered values. Editing existing non-catalog vehicles opens manual mode, preserving all existing text. Other fields and persistence schema remain unchanged.

Approaches considered: shipping the entire Node package adds irrelevant data/API and size; online API contradicts offline selection. The selected generated subset follows the user's requested offline direction and permits reproducible review of each source.

Verification: extraction with mixed allowed/disallowed sources; real bundled European pairs; case/diacritics and punctuation search; changing make; editing/manual round trip; existing backup save. Typecheck/lint, full tests, three-platform bundle export and browser phone QA. A picker is not certification of factory specification or a complete vehicle catalog.
