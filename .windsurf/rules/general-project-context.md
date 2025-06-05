---
trigger: always_on
---

## Project Overview
You are assisting in the development of "Open Sprunk Framework," a client-side creative game specified using MDMD (Membrane Design MarkDown). Your primary role is to help create, refine, and manage MDMD specification documents and, eventually, the JavaScript source code based on these specifications.

## Core MDMD Workflow & Document Structure (Strata Organization)
This project follows a layered MDMD approach based on "Strata Organization". Understand these layers and where different types of information belong:

1.  **`docs/Definition/Vision/`**: Contains high-level ideas, goals, and originating concepts. These are typically free-form Markdown (`.md`) or MDMD `{composition}` or `{unit}` files (e.g., `composition-type="project-vision-overview"`, `unit-type="vision-statement"`). You will usually read from here for context.
2.  **`docs/Definition/Requirements/`**: Contains specific requirements for the system, typically as MDMD `{unit}` files (e.g., `unit-type="functional-requirement"`, `unit-type="user-story"`) and potentially `{composition}` files to group related requirements (e.g., `composition-type="feature-requirements-group"`).
    *   When defining requirements, ensure each requirement `{unit}` has a clear `id`, `brief`, `unit-type`, `status`, and detailed description.
    *   Use conventional options like `priority`, `owner`, and `acceptance-criteria` in the YAML block of requirement units.
3.  **`docs/Specification/Concepts/`**: Contains architectural designs, module breakdowns, and data flow diagrams. These are MDMD `{composition}` files (e.g., `composition-type="software-module-definition"`, `composition-type="system-architecture-overview"`).
    *   These **MUST** link to constituent `{unit}`s (from `docs/Specification/Implementations/` or `docs/Definition/Requirements/`) and other relevant `{composition}`s using `[[id]]` syntax.
4.  **`docs/Specification/Implementations/`**: Contains detailed specifications for concrete, implementable artifacts (like code files or data schemas). These are MDMD `{unit}` files (e.g., `unit-type="javascript-class-definition"`, `unit-type="html-page-definition"`).
    *   These **MUST** include a `source-ref` attribute pointing to the intended location of the corresponding source code file within the `src/` directory (e.g., `source-ref: "../../../src/core/EventBus.js"` if the unit is in `docs/Specification/Implementations/core/`).
    *   The body of these units, especially the fenced code block, should define the *contract* or essential structure, not necessarily the full implementation (unless the `unit-type` implies it, like for `html-page-definition`).
5.  **`src/`**: Contains the actual JavaScript, HTML, and CSS source code. Files here **MUST** correspond to a `{unit}` defined in `docs/Specification/Implementations/`.

**The MDMD Flow (Iterative Strata):**
Work generally proceeds from Definition (Vision -> Requirements) to Specification (Concepts -> Implementations -> Src), but expect iterative refinement. Insights from lower strata (e.g., an implementation detail in `src/` or a constraint discovered while defining an Implementation `Unit`) can and should lead to updates in higher-level documents (Concepts, Requirements).

```mermaid
graph TD
    A["<strong>Definition/Vision</strong><br/>docs/Definition/Vision/"] --> B;
    B["<strong>Definition/Requirements</strong><br/>docs/Definition/Requirements/"] --> C;
    C["<strong>Specification/Concepts</strong><br/>docs/Specification/Concepts/"] --> D;
    D["<strong>Specification/Implementations</strong><br/>docs/Specification/Implementations/"] --> E;
    E["<strong>IMPLEMENTATION (Code)</strong><br/>src/"];

    E --> D; D --> C; C --> B; B --> A; %% Feedback loops
```

## Key MDMD Authoring Guidelines for Copilot:

*   **File Naming and Location:**
    *   When asked to create a new MDMD file, place it in the correct strata directory (Vision, Requirements, Concepts, Implementations) based on its purpose.
    *   MDMD files should end with `.mdmd` (e.g., `my-new-requirement.mdmd`).
*   **IDs and Linking:**
    *   Every `{unit}` and `{composition}` **MUST** have a globally unique `id` using kebab-case format (e.g., "user-service-class", "auth-module-composition").
    *   **Optional `title` Attribute:** Include human-readable titles for display purposes (e.g., `title: "User Service Class"`).
    *   **CRITICAL: Cross-Reference Standards:**
        *   **Primary Pattern:** Use `[[target-id]]` for MDMD-to-MDMD references within the document set
        *   **Semantic Context:** Always provide explicit prose around links explaining the relationship nature
        *   **Example:** "This authentication service (see `[[user-login-service]]`) implements the core requirement `[[req-user-authentication]]` as part of the broader `[[auth-module-architecture]]`."
    *   **CRITICAL: Dependency Linking Strategy (Enhanced):**
        *   MDMD documents form an interconnected graph. You **MUST** create these connections using **Minimal Sufficient Linking**.
        *   **Core Linking Principle:** Link only what is necessary for: (1) Implementation correctness, (2) Requirements traceability, (3) Navigation between adjacent strata.
        *   **Dependency Flow Direction:** Lower-strata elements link to what they depend ON (unidirectional). Higher-strata elements do NOT automatically link back unless critical for navigation.
        *   **Relationship Types to Link:**
            *   **Implementation Dependencies:** Element A cannot function without Element B → A links to B
            *   **Traceability Links:** Implementation back to requirements (critical for compliance)
            *   **Adjacent Strata Navigation:** Bidirectional `see-also` between Requirements ↔ Concepts ↔ Implementations
        *   **What NOT to Link:** Exhaustive "mentioned in" references, loose conceptual associations, transitive dependencies (A→B→C, don't link A→C unless direct)