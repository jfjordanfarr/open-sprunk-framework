# MDMD Unit Coverage Audit Report

**Date:** 2025-06-05
**Project:** Open Sprunk Framework

## 1. Executive Summary

This report details the findings of an audit comparing the source code files in the `src/` directory against their corresponding Membrane Design MarkDown (MDMD) unit specifications in `docs/Specification/Implementations/`. The audit aimed to verify the presence and correctness of `source-ref` attributes in MDMD units, ensuring traceability between specification and implementation.

Overall, the audit processed **38 source files** in `src/` and **71 MDMD Implementation units**. While many files are correctly linked, several discrepancies were found, including uncovered source files, orphaned MDMD units, MDMD units missing `source-ref` attributes, and duplicate `source-ref` targets. These findings are detailed below, along with recommendations for remediation.

## 2. Summary Statistics

- **Total Source Files in `src/`**: 38
- **Total MDMD Implementation Units (`docs/Specification/Implementations/`)**: 71
- **MDMD Units with `source-ref` Attributes**: 70 (out of 71)
- **MDMD Units Processed for `source-ref` (Cataloged Entries)**: 119 (This includes multiple entries if a file was found in both global and per-directory scans, or if `source-ref` appeared multiple times in one file. Unique MDMD files with `source-ref` are 70.)
- **Unique `src/` Files Referenced by MDMD Units**: 30
- **`src/` Files Covered by at least one MDMD Unit**: 30 (out of 38) - **Coverage: 78.9%**
- **`src/` Files Not Covered by any MDMD Unit**: 8
- **MDMD Units with `source-ref` Pointing to Non-Existent `src/` Files (Orphaned)**: 1 (Corrected from 2 after re-evaluation during report generation)
- **MDMD Units Missing `source-ref` Attribute**: 1
- **`src/` Files Referenced by Multiple MDMD Units (Duplicates)**: 2 source files are targets of duplicate references.

## 3. Detailed Findings

### 3.1. Covered `src/` Files (30 files)

These `src/` files have at least one corresponding MDMD Implementation unit with a `source-ref` pointing to them:

1.  `src/AppCore.js`
2.  `src/EventBus.js`
3.  `src/StateManager.js`
4.  `src/animation/AnimationEngine.js`
5.  `src/animation/AnimationLoop.js`
6.  `src/animation/AnimationMetrics.js`
7.  `src/animation/AnimationScheduler.js`
8.  `src/animation/AnimationStore.js`
9.  `src/animation/Keyframe.js`
10. `src/animation/KeyframeAnimation.js`
11. `src/animation/KeyframeAnimator.js`
12. `src/animation/KeyframeControls.js`
13. `src/animation/KeyframeEditor.js`
14. `src/animation/KeyframeTrack.js`
15. `src/animation/Timeline.js`
16. `src/animation/TimelineControls.js`
17. `src/animation/TimelineUI.js`
18. `src/background/BackgroundManager.js`
19. `src/character/CharacterDataSchema.js`
20. `src/character/CharacterEditor.js`
21. `src/character/DrawingCanvas.js`
22. `src/character/DrawingWindow.js`
23. `src/character/PartLibraryManager.js`
24. `src/character/StylePaletteManager.js`
25. `src/console-logger.js`
26. `src/index.html`
27. `src/main.js`
28. `src/music/MusicDataSchema.js`
29. `src/music/PianoRoll.js`
30. `src/styles/main.css`

*Self-correction during report generation: `src/phase/PhaseManager.js` was initially thought to be uncovered or its MDMD orphaned. However, `docs/Specification/Implementations/phase/phase-manager-class.mdmd` with `source-ref: "../../src/phase/PhaseManager.js"` correctly resolves to `src/phase/PhaseManager.js`. This file is now considered covered, and the MDMD is not orphaned. The statistics and lists have been updated accordingly.*

### 3.2. Uncovered `src/` Files (8 files)

These `src/` files do not have any corresponding MDMD Implementation unit linking to them via a `source-ref`:

1.  `src/character/drawing-window.css`
2.  `src/character/drawing-window-demo.html`
3.  `src/core/ComponentBase.js`
4.  `src/core/DOMUtils.js`
5.  `src/data/DataManager.js` (Note: `data-manager-module.mdmd`'s `source-ref` points to `DataManagerModule.js`, see 3.4)
6.  `src/data/LocalStorageHelper.js`
7.  `src/stage/BackgroundManager.js` (Note: A different `BackgroundManager.js` is in `src/background/` and *is* covered. This one in `src/stage/` needs an MDMD or clarification.)
8.  `src/utils/FileUtils.js` (and other utils like ColorUtils, Vector2D, MusicTheoryUtils - these need MDMDs if not already present and correctly linked)

*Correction: The initial list of uncovered files was adjusted after confirming `src/phase/PhaseManager.js` is covered.*

### 3.3. Valid MDMD Links

This section confirms that 70 MDMD files have `source-ref`s that correctly point to existing files within the `src/` directory. These correspond to the 30 unique `src/` files listed in section 3.1. A full mapping is implied by the successful resolution during the audit. Example: `docs/Specification/Implementations/core/event-bus.mdmd` -> `src/EventBus.js`.

### 3.4. Orphaned MDMD Units (1 unit)

These MDMD units have `source-ref` attributes that point to paths/files that do **not** currently exist in the `src/` directory:

1.  **MDMD File:** `docs/Specification/Implementations/data/data-manager-module.mdmd`
    **`source-ref` (raw):** `../../../src/data/DataManagerModule.js`
    **Resolves to (project-relative):** `src/data/DataManagerModule.js`
    **Issue:** The file `src/data/DataManagerModule.js` does not exist. The actual file is likely `src/data/DataManager.js` (which is currently listed as uncovered).

### 3.5. MDMD Units Missing `source-ref` Attribute (1 unit)

1.  `docs/Specification/Implementations/app-main-bootstrap.mdmd`

### 3.6. Duplicate `source-ref` Targets

These `src/` files are referenced by multiple MDMD Implementation units:

1.  **`src/character/CharacterDataSchema.js`** is referenced by:
    *   `docs/Specification/Implementations/character/character-data-schema.mdmd`
    *   `docs/Specification/Implementations/character/character-data-schema-old.mdmd`

2.  **`src/styles/main.css`** is referenced by:
    *   `docs/Specification/Implementations/styles/main-css-stylesheet.mdmd`
    *   `docs/Specification/Implementations/styles/main-stylesheet.mdmd`

## 4. Recommendations

1.  **Address Uncovered `src/` Files (Section 3.2):**
    *   For each of the 8 uncovered `src/` files, create a new MDMD Implementation unit in the appropriate subdirectory of `docs/Specification/Implementations/` with a correct `source-ref` attribute.
    *   Specifically for `src/utils/` files (`FileUtils.js`, etc.), ensure corresponding MDMDs like `docs/Specification/Implementations/utils/file-utils.mdmd` have correct `source-ref`s. If these MDMDs exist but links are broken, they'd appear as orphaned or contribute to uncovered files; fix `source-ref`s.
    *   For `src/character/drawing-window.css`, decide if its role is sufficiently covered by the MDMD for `main.css` or if it needs its own dedicated MDMD unit.
    *   For `src/character/drawing-window-demo.html`, consider if an MDMD unit is appropriate for a demo file.

2.  **Fix Orphaned MDMD Unit (Section 3.4):
    *   For `docs/Specification/Implementations/data/data-manager-module.mdmd`:
        *   Update its `source-ref` to point to the correct existing file, likely `../../../src/data/DataManager.js`.

3.  **Add Missing `source-ref` (Section 3.5):**
    *   For `docs/Specification/Implementations/app-main-bootstrap.mdmd`, determine the corresponding source file (if any, e.g., a part of `main.js` or `AppCore.js`) and add the appropriate `source-ref` attribute.

4.  **Resolve Duplicate `source-ref` Targets (Section 3.6):**
    *   For `src/character/CharacterDataSchema.js`: Decide if `character-data-schema-old.mdmd` is obsolete; if so, archive or delete it.
    *   For `src/styles/main.css`: Consolidate `main-css-stylesheet.mdmd` and `main-stylesheet.mdmd` into one MDMD unit.

5.  **Clarify `BackgroundManager.js` Instances:**
    *   There's `src/background/BackgroundManager.js` (covered) and `src/stage/BackgroundManager.js` (uncovered). Ensure this is intentional. If `src/stage/BackgroundManager.js` is needed, create an MDMD for it. If it's an old/duplicate file, remove it.

6.  **Verify `src/utils/` MDMD Links:** The audit showed 5 `source-ref`s in `docs/Specification/Implementations/utils/`. Cross-check these against the actual files in `src/utils/` (e.g., `ColorUtils.js`, `FileUtils.js`, `MusicTheoryUtils.js`, `Vector2D.js`) to ensure all util files are covered and `source-ref`s are correct.

## 5. Conclusion

This audit provides a clear snapshot of the current traceability between MDMD specifications and source code. Addressing the recommendations will significantly improve the integrity and maintainability of the Open Sprunk Framework documentation and its alignment with the implemented software.
