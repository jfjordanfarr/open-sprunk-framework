<!-- filepath: g:\My Drive\Projects\Toy Projects\Spruki-Like-Game\AgentOps\AI_SESSION_STATE.md -->
## AI Session State - 2025-06-01

**Project:** Sprunki-like Game

**Phase:** Documentation & Specification (MDMD Refactoring)

**Last User Instruction:** User provided feedback on the MDMD process, encouraging flexibility and a "Code Like Clay" approach. Confirmed that the current plan to finish creating unit files is acceptable, with the understanding that the order of operations can be adjusted if it feels more intuitive.

**Summary of Work Completed:**

1.  **Initial Setup:** Clarified the MDMD-driven workflow: Idea -> Docs (Compositions & Units) -> Src. Confirmed that the `src/` directory is currently empty and all work is focused on creating specification documents.
2.  **Main Specification File:** `docs/SpunkiGameSpec.mdmd.md` is the primary source for definitions.
3.  **Refactoring `SpunkiGameSpec.mdmd.md`:**
    *   The goal is to extract all `composition` and `unit` blocks into their own `.mdmd` files within `docs/Compositions/` and `docs/Units/` respectively.
    *   The main `SpunkiGameSpec.mdmd.md` will then use MyST `include` directives to link to these individual files.
    *   **Compositions Created so far:**
        *   `docs/Compositions/sprunki-game-project.mdmd`
        *   `docs/Compositions/sprunki-core-architecture.mdmd`
        *   `docs/Compositions/sprunki-module-structure.mdmd`
        *   `docs/Compositions/sprunki-data-flow.mdmd`
        *   `docs/Compositions/app-core-module.mdmd`
        *   `docs/Compositions/character-editor-module.mdmd`
        *   `docs/Compositions/music-editor-module.mdmd`
        *   `docs/Compositions/animation-editor-module.mdmd`
        *   `docs/Compositions/stage-module.mdmd`
        *   `docs/Compositions/data-manager-module.mdmd`
        *   `docs/Compositions/vector-graphics-system.mdmd`
    *   **Units Created so far:**
        *   `docs/Units/html-main-page.mdmd` (source-ref: `../src/index.html`)
        *   `docs/Units/app-main-bootstrap.mdmd` (source-ref: `../src/main.js`)
        *   `docs/Units/core/app-core-class.mdmd` (source-ref: `../../src/core/AppCore.js`)
        *   `docs/Units/core/event-bus-class.mdmd` (source-ref: `../../src/core/EventBus.js`)
        *   `docs/Units/core/state-manager-class.mdmd` (source-ref: `../../src/core/StateManager.js`)
        *   `docs/Units/character/character-editor-class.mdmd` (source-ref: `../../src/character/CharacterEditor.js`)
        *   `docs/Units/character/drawing-canvas-class.mdmd` (source-ref: `../../src/character/DrawingCanvas.js`)
        *   `docs/Units/character/texture-manager-class.mdmd` (source-ref: `../../src/character/TextureManager.js`)
        *   `docs/Units/character/character-data-schema.mdmd` (source-ref: `../../src/character/CharacterData.js`)
        *   `docs/Units/music/music-editor-class.mdmd` (source-ref: `../../src/music/MusicEditor.js`)
        *   `docs/Units/music/piano-roll-class.mdmd` (source-ref: `../../src/music/PianoRoll.js`)
        *   `docs/Units/music/instrument-selector-class.mdmd` (source-ref: `../../src/music/InstrumentSelector.js`)
        *   `docs/Units/music/audio-engine-class.mdmd` (source-ref: `../../src/music/AudioEngine.js`)
        *   `docs/Units/music/music-data-schema.mdmd` (source-ref: `../../src/music/MusicData.js`)
        *   `docs/Units/animation/animation-editor-class.mdmd` (source-ref: `../../src/animation/AnimationEditor.js`)
        *   `docs/Units/animation/timeline-class.mdmd` (source-ref: `../../src/animation/Timeline.js`)
        *   `docs/Units/animation/property-editor-class.mdmd` (source-ref: `../../src/animation/PropertyEditor.js`)
        *   `docs/Units/animation/tween-engine-class.mdmd` (source-ref: `../../src/animation/TweenEngine.js`)
        *   `docs/Units/animation/animation-data-schema.mdmd` (source-ref: `../../src/animation/AnimationData.js`)
        *   `docs/Units/stage/performance-stage-class.mdmd` (source-ref: `../../src/stage/PerformanceStage.js`)
        *   `docs/Units/stage/character-renderer-class.mdmd` (source-ref: `../../src/stage/CharacterRenderer.js`)
        *   `docs/Units/stage/background-manager-class.mdmd` (source-ref: `../../src/stage/BackgroundManager.js`)
        *   `docs/Units/data/data-manager-class.mdmd` (source-ref: `../../src/data/DataManager.js`)
        *   `docs/Units/data/project-file-schema.mdmd` (source-ref: `../../src/data/ProjectFileSchema.js`)
        *   `docs/Units/data/local-storage-class.mdmd` (source-ref: `../../src/data/LocalStorage.js`)
        *   `docs/Units/utils/vector2d-utils.mdmd` (source-ref: `../../src/utils/Vector2D.js`)
        *   `docs/Units/utils/color-utils.mdmd` (source-ref: `../../src/utils/ColorUtils.js`)
        *   `docs/Units/utils/file-utils.mdmd` (source-ref: `../../src/utils/FileUtils.js`)
    *   Created directories:
        *   `docs/Units/core/`
        *   `docs/Units/character/`
        *   `docs/Units/music/`
        *   `docs/Units/animation/`
        *   `docs/Units/stage/`
        *   `docs/Units/data/`
        *   `docs/Units/utils/`
4.  **File Path and `source-ref` Handling:**
    *   Each new file includes a `<!-- filepath: ... -->` comment.
    *   `source-ref` attributes in unit files are being updated to be relative to their new location in `docs/Units/`, pointing correctly to the eventual `src/` file.
5.  **User Feedback:** User confirmed understanding of MDMD flexibility, encouraging a creative and non-rigid approach to the order of extracting compositions and units.

**Next Steps:**

1.  Extract all `unit` blocks from `docs/SpunkiGameSpec.mdmd.md` into individual files in `docs/Units/`, mirroring the intended `src/` directory structure. This includes:
    *   Creating necessary subdirectories within `docs/Units/` (e.g., `core/`, `character/`).
    *   Ensuring each new unit file has a `<!-- filepath: ... -->` comment.
    *   Adjusting `source-ref` paths in unit files to be relative to their new location (e.g., `../src/...` or `../../src/...`).
2.  Ensure `docs/SpunkiGameSpec.mdmd.md` is fully updated with `include` directives for all extracted compositions and units.
3.  Proceed to create actual `src/` files based on these unit specifications.

**Pending User Clarifications/Decisions:**
*   None currently. User feedback on MDMD spec was solicited, no direct action required from user yet.

**Workspace Structure (Relevant Portion):**
```
docs/
├── Compositions/
│   ├── animation-editor-module.mdmd
│   ├── app-core-module.mdmd
│   ├── character-editor-module.mdmd
│   ├── data-manager-module.mdmd
│   ├── music-editor-module.mdmd
│   ├── sprunki-core-architecture.mdmd
│   ├── sprunki-data-flow.mdmd
│   ├── sprunki-game-project.mdmd
│   ├── sprunki-module-structure.mdmd
│   ├── stage-module.mdmd
│   └── vector-graphics-system.mdmd
├── Units/
│   ├── app-main-bootstrap.mdmd
│   ├── html-main-page.mdmd
│   ├── animation/
│   │   ├── animation-data-schema.mdmd
│   │   ├── animation-editor-class.mdmd
│   │   ├── property-editor-class.mdmd
│   │   ├── timeline-class.mdmd
│   │   └── tween-engine-class.mdmd
│   ├── character/
│   │   ├── character-data-schema.mdmd
│   │   ├── character-editor-class.mdmd
│   │   ├── drawing-canvas-class.mdmd
│   │   └── texture-manager-class.mdmd
│   ├── core/
│   │   ├── app-core-class.mdmd
│   │   ├── event-bus-class.mdmd
│   │   └── state-manager-class.mdmd
│   ├── data/
│   │   ├── data-manager-class.mdmd
│   │   ├── local-storage-class.mdmd
│   │   └── project-file-schema.mdmd
│   ├── music/
│   │   ├── audio-engine-class.mdmd
│   │   ├── instrument-selector-class.mdmd
│   │   ├── music-data-schema.mdmd
│   │   ├── music-editor-class.mdmd
│   │   └── piano-roll-class.mdmd
│   ├── stage/
│   │   ├── background-manager-class.mdmd
│   │   ├── character-renderer-class.mdmd
│   │   └── performance-stage-class.mdmd
│   └── utils/
│       ├── color-utils.mdmd
│       ├── file-utils.mdmd
│       └── vector2d-utils.mdmd
├── SpunkiGameSpec.mdmd.md
...
```