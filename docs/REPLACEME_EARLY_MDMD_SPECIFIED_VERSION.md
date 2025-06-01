::: {composition}  
id: "sprunki-game-overall-project"  
composition-type: "project-definition"  
status: "idea"  
version: "0.1"  
brief: "Top-level composition for the open-source Sprunki-like creative game."  
see-also: \["\[\[sprunki-vision-and-goals\]\]", "\[\[sprunki-core-features\]\]", "\[\[sprunki-architecture-overview\]\]", "\[\[sprunki-module-breakdown\]\]", "\[\[sprunki-implementation-considerations\]\]", "\[\[sprunki-initial-prototype-plan\]\]"\]

This document specifies the design for an open-source, client-side Sprunki-like game.  
The game allows players to create characters, compose music loops, and design animations.  
It is structured using the Membrane Design MarkDown (MDMD) approach.  
:::

::: {composition}  
id: "sprunki-vision-and-goals"  
composition-type: "project-vision"  
status: "idea"  
version: "0.1"  
brief: "Defines the core vision, inspiration, and guiding principles for the Sprunki-like game."  
see-also: \["\[\[sprunki-game-overall-project\]\]", "\[\[unit-vision-statement\]\]", "\[\[unit-inspiration-sources\]\]", "\[\[unit-core-tenet-user-creation\]\]", "\[\[unit-core-tenet-client-side\]\]", "\[\[unit-core-tenet-open-source\]\]", "\[\[unit-core-tenet-interpolation-animation\]\]"\]

\#\# Vision & Goals

This section outlines the fundamental "why" behind the Sprunki-like game.

\[\[unit-vision-statement\]\]  
\[\[unit-inspiration-sources\]\]

\#\#\# Core Tenets  
The following principles guide the design and development:  
\- \[\[unit-core-tenet-user-creation\]\]  
\- \[\[unit-core-tenet-client-side\]\]  
\- \[\[unit-core-tenet-open-source\]\]  
\- \[\[unit-core-tenet-interpolation-animation\]\]  
:::

::: {unit}  
id: "unit-vision-statement"  
unit-type: "design-statement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "The primary vision for the Sprunki-like game."

To create a delightful, 100% client-side, open-source creative game where users can design unique "Sprunki-like" characters, compose their own music loops, and bring their creations to life with custom animations. The experience should foster self-expression, playful experimentation, and the ability to easily save and share creations (via file export/import).  
:::

::: {unit}  
id: "unit-inspiration-sources"  
unit-type: "design-inspiration"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Key inspirations for the game's concept."

Drawing inspiration from the creature customization of games like Spore, the musical creativity of loop-based music software, and the charm of character-driven virtual toys. The key is accessibility and immediate creative feedback, all within the browser.  
:::

::: {unit}  
id: "unit-core-tenet-user-creation"  
unit-type: "design-principle"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Core tenet: Focus on user creation."

The primary gameplay is the act of creating.  
:::

::: {unit}  
id: "unit-core-tenet-client-side"  
unit-type: "design-principle"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Core tenet: Client-side simplicity."

No server-side dependencies for core functionality, ensuring ease of use and distribution.  
:::

::: {unit}  
id: "unit-core-tenet-open-source"  
unit-type: "design-principle"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Core tenet: Open source and modular."

Built with extensibility in mind, leveraging existing open-source components.  
:::

::: {unit}  
id: "unit-core-tenet-interpolation-animation"  
unit-type: "design-principle"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Core tenet: Interpolation-based animation."

Smooth, procedural animation rather than frame-by-frame drawing for animations.  
:::

::: {composition}  
id: "sprunki-core-features"  
composition-type: "feature-set-overview"  
status: "idea"  
version: "0.1"  
brief: "Overview of the core user-facing features of the Sprunki-like game."  
see-also: \["\[\[sprunki-game-overall-project\]\]", "\[\[feature-character-creator\]\]", "\[\[feature-music-loop-creator\]\]", "\[\[feature-animation-system\]\]", "\[\[feature-performance-stage\]\]", "\[\[feature-project-management\]\]"\]

This composition outlines the primary interactions and capabilities users will have within the game. Each feature represents a significant area of functionality.

\- \[\[feature-character-creator\]\]  
\- \[\[feature-music-loop-creator\]\]  
\- \[\[feature-animation-system\]\]  
\- \[\[feature-performance-stage\]\]  
\- \[\[feature-project-management\]\]  
:::

::: {composition}  
id: "feature-character-creator"  
composition-type: "major-feature-definition"  
status: "idea"  
version: "0.1"  
brief: "Defines the Character Creator feature, allowing users to design Sprunki characters."  
see-also: \["\[\[sprunki-core-features\]\]", "\[\[unit-char-creator-interface\]\]", "\[\[unit-char-creator-drawing\]\]", "\[\[unit-char-creator-customization\]\]", "\[\[unit-char-creator-textures\]\]", "\[\[unit-char-creator-pivots\]\]", "\[\[unit-char-creator-output-data\]\]"\]

The Character Creator is a dedicated module for designing Sprunki characters.

\*\*Key Aspects:\*\*  
\- \*\*Interface:\*\* \[\[unit-char-creator-interface\]\]  
\- \*\*Drawing/Assembly:\*\* \[\[unit-char-creator-drawing\]\]  
\- \*\*Customization:\*\* \[\[unit-char-creator-customization\]\]  
\- \*\*Texture Support:\*\* \[\[unit-char-creator-textures\]\]  
\- \*\*Pivot Points:\*\* \[\[unit-char-creator-pivots\]\]  
\- \*\*Output:\*\* \[\[unit-char-creator-output-data\]\]  
:::

::: {unit}  
id: "unit-char-creator-interface"  
unit-type: "ui-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for a dedicated interface for character creation."

A dedicated module/interface for designing Sprunki characters.  
:::

::: {unit}  
id: "unit-char-creator-drawing"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for drawing or assembling character parts."

Users can draw custom vector shapes (e.g., body, limbs, eyes) or assemble characters from a library of primitive shapes.  
:::

::: {unit}  
id: "unit-char-creator-customization"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for tools to customize character parts."

Tools for coloring, scaling, rotating, and arranging parts.  
:::

::: {unit}  
id: "unit-char-creator-textures"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for applying textures to character parts."

Ability to apply colors, gradients, or user-uploaded images as textures to character parts.  
:::

::: {unit}  
id: "unit-char-creator-pivots"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for defining pivot points for animation."

Users can define pivot points on character parts for articulation during animation.  
:::

::: {unit}  
id: "unit-char-creator-output-data"  
unit-type: "data-structure-definition"  
language: "json-schema" \# Conceptual schema  
status: "idea"  
version: "0.1"  
brief: "Defines the expected output data structure for a character."

\`\`\`json  
{  
  "type": "object",  
  "properties": {  
    "id": { "type": "string", "description": "Unique ID for the character" },  
    "name": { "type": "string", "description": "User-defined name" },  
    "parts": {  
      "type": "array",  
      "items": {  
        "type": "object",  
        "properties": {  
          "partId": { "type": "string" },  
          "shapeData": { "type": "object", "description": "Vector data or primitive type" },  
          "color": { "type": "string" },  
          "textureRef": { "type": "string", "description": "Reference to an uploaded texture or internal ID" },  
          "transform": { "type": "object", "properties": { "x": "number", "y": "number", "rotation": "number", "scaleX": "number", "scaleY": "number" } },  
          "pivot": { "type": "object", "properties": { "x": "number", "y": "number" } },  
          "parentId": { "type": \["string", "null"\], "description": "ID of the parent part for hierarchy" }  
        },  
        "required": \["partId", "shapeData"\]  
      }  
    }  
  },  
  "required": \["id", "parts"\]  
}

The above is a conceptual schema. The actual implementation might vary based on the chosen drawing library (Paper.js/Fabric.js).  
The output should capture vector information, texture references, pivot points, and part hierarchy.  
:::  
::: {composition}  
id: "feature-music-loop-creator"  
composition-type: "major-feature-definition"  
status: "idea"  
version: "0.1"  
brief: "Defines the Music Loop Creator feature for composing musical loops."  
see-also: \["\[\[sprunki-core-features\]\]", "\[\[unit-music-creator-interface\]\]", "\[\[unit-music-creator-piano-roll\]\]", "\[\[unit-music-creator-instruments\]\]", "\[\[unit-music-creator-sample-support\]\]", "\[\[unit-music-creator-loop-controls\]\]", "\[\[unit-music-creator-output-data\]\]"\]  
The Music Loop Creator is a dedicated module for composing music.

**Key Aspects:**

* **Interface:** \[\[unit-music-creator-interface\]\]  
* **Piano Roll:** \[\[unit-music-creator-piano-roll\]\]  
* **Instruments:** \[\[unit-music-creator-instruments\]\]  
* **Sample Support:** \[\[unit-music-creator-sample-support\]\]  
* **Loop Controls:** \[\[unit-music-creator-loop-controls\]\]  
* Output: \[\[unit-music-creator-output-data\]\]  
  :::

::: {unit}  
id: "unit-music-creator-interface"  
unit-type: "ui-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for a dedicated interface for music composition."  
A dedicated module/interface for composing music.  
:::  
::: {unit}  
id: "unit-music-creator-piano-roll"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for a piano roll interface for note input."  
A visual interface (piano roll) for placing and editing notes over a timeline.  
:::  
::: {unit}  
id: "unit-music-creator-instruments"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for predefined synthesized instruments."  
A selection of simple, pre-defined synthesized instruments (e.g., sine wave synth, square wave lead, simple percussion) powered by the Web Audio API.  
:::  
::: {unit}  
id: "unit-music-creator-sample-support"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for users to upload their own audio samples."  
Ability for users to upload their own short sound samples (e.g., a vocal snippet, a custom drum sound) to be triggered in the loop.  
:::  
::: {unit}  
id: "unit-music-creator-loop-controls"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for music loop controls like tempo and length."  
Controls to set tempo (BPM), loop length (e.g., 4, 8, 16 beats), and time signature.  
:::  
::: {unit}  
id: "unit-music-creator-output-data"  
unit-type: "data-structure-definition"  
language: "json-schema" \# Conceptual schema  
status: "idea"  
version: "0.1"  
brief: "Defines the expected output data structure for a music loop."  
{  
  "type": "object",  
  "properties": {  
    "id": { "type": "string", "description": "Unique ID for the music loop" },  
    "tempo": { "type": "number", "description": "Beats per minute" },  
    "timeSignature": { "type": "string", "pattern": "^\[0-9\]+/\[0-9\]+$", "description": "e.g., 4/4" },  
    "loopLengthBeats": { "type": "integer", "description": "Length of the loop in beats" },  
    "tracks": {  
      "type": "array",  
      "items": {  
        "type": "object",  
        "properties": {  
          "trackId": { "type": "string" },  
          "instrumentId": { "type": "string", "description": "Ref to predefined synth or uploaded sample" },  
          "notes": {  
            "type": "array",  
            "items": {  
              "type": "object",  
              "properties": {  
                "pitch": { "type": "string", "description": "e.g., C4, MIDI number" },  
                "startTimeBeats": { "type": "number" },  
                "durationBeats": { "type": "number" },  
                "velocity": { "type": "number", "minimum": 0, "maximum": 1 }  
              },  
              "required": \["pitch", "startTimeBeats", "durationBeats"\]  
            }  
          }  
        },  
        "required": \["trackId", "instrumentId", "notes"\]  
      }  
    }  
  },  
  "required": \["id", "tempo", "tracks"\]  
}

The output should capture note sequences, instrument choices (including references to uploaded samples), and tempo information.  
:::  
::: {composition}  
id: "feature-animation-system"  
composition-type: "major-feature-definition"  
status: "idea"  
version: "0.1"  
brief: "Defines the Animation System for creating character animations."  
see-also: \["\[\[sprunki-core-features\]\]", "\[\[unit-animation-sys-interface\]\]", "\[\[unit-animation-sys-keyframing\]\]", "\[\[unit-animation-sys-interpolation\]\]", "\[\[unit-animation-sys-preview\]\]", "\[\[unit-animation-sys-library\]\]", "\[\[unit-animation-sys-output-data\]\]"\]  
The Animation System is a dedicated module for animating the created character.

**Key Aspects:**

* **Interface:** \[\[unit-animation-sys-interface\]\]  
* **Timeline-Based Keyframing:** \[\[unit-animation-sys-keyframing\]\]  
* **Interpolation:** \[\[unit-animation-sys-interpolation\]\]  
* **Character Preview:** \[\[unit-animation-sys-preview\]\]  
* **Animation Library (Optional):** \[\[unit-animation-sys-library\]\]  
* Output: \[\[unit-animation-sys-output-data\]\]  
  :::

::: {unit}  
id: "unit-animation-sys-interface"  
unit-type: "ui-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for a dedicated interface for character animation."  
A dedicated module/interface for animating the created character.  
:::  
::: {unit}  
id: "unit-animation-sys-keyframing"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for timeline-based keyframing of character properties."  
Users set keyframes on a timeline for various properties of character parts (position, rotation, scale).  
:::  
::: {unit}  
id: "unit-animation-sys-interpolation"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for automatic interpolation between keyframes."  
The system automatically generates smooth transitions between keyframes using interpolation methods (e.g., linear, ease-in, ease-out).  
:::  
::: {unit}  
id: "unit-animation-sys-preview"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for a live preview of the animation."  
A live preview of the character performing the animation.  
:::  
::: {unit}  
id: "unit-animation-sys-library"  
unit-type: "optional-feature"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Optional: Pre-defined animation snippets."  
Pre-defined animation snippets (e.g., simple dance moves, idle animations) that users can apply and customize.  
:::  
::: {unit}  
id: "unit-animation-sys-output-data"  
unit-type: "data-structure-definition"  
language: "json-schema" \# Conceptual schema  
status: "idea"  
version: "0.1"  
brief: "Defines the expected output data structure for an animation."  
{  
  "type": "object",  
  "properties": {  
    "id": { "type": "string", "description": "Unique ID for the animation" },  
    "name": { "type": "string" },  
    "durationSeconds": { "type": "number" },  
    "tracks": {  
      "type": "array",  
      "items": {  
        "type": "object",  
        "properties": {  
          "partIdRef": { "type": "string", "description": "References a partId from CharacterData" },  
          "property": { "type": "string", "enum": \["x", "y", "rotation", "scaleX", "scaleY", "opacity"\] },  
          "keyframes": {  
            "type": "array",  
            "items": {  
              "type": "object",  
              "properties": {  
                "time": { "type": "number", "description": "Time in seconds" },  
                "value": { "type": "number" },  
                "easing": { "type": "string", "enum": \["linear", "easeIn", "easeOut", "easeInOut"\], "default": "linear" }  
              },  
              "required": \["time", "value"\]  
            }  
          }  
        },  
        "required": \["partIdRef", "property", "keyframes"\]  
      }  
    }  
  },  
  "required": \["id", "durationSeconds", "tracks"\]  
}

The output should capture keyframe information for each animated part property, timing, and interpolation types.  
:::  
::: {composition}  
id: "feature-performance-stage"  
composition-type: "major-feature-definition"  
status: "idea"  
version: "0.1"  
brief: "Defines the Performance Stage where creations are viewed."  
see-also: \["\[\[sprunki-core-features\]\]", "\[\[unit-stage-interface\]\]", "\[\[unit-stage-synchronization\]\]", "\[\[unit-stage-backgrounds\]\]"\]  
The Performance Stage is the main view where the character, its animation, and the music loop come together.

**Key Aspects:**

* **Interface:** \[\[unit-stage-interface\]\]  
* **Synchronization:** \[\[unit-stage-synchronization\]\]  
* Backgrounds: \[\[unit-stage-backgrounds\]\]  
  :::

::: {unit}  
id: "unit-stage-interface"  
unit-type: "ui-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for the main viewing interface."  
The main view where the character, its animation, and the music loop come together.  
:::  
::: {unit}  
id: "unit-stage-synchronization"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for synchronizing animation with music."  
Animations are synchronized with the music loop.  
:::  
::: {unit}  
id: "unit-stage-backgrounds"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for customizable backgrounds on stage."  
Simple customizable backgrounds (solid colors, gradients, or user-uploaded images).  
:::  
::: {composition}  
id: "feature-project-management"  
composition-type: "major-feature-definition"  
status: "idea"  
version: "0.1"  
brief: "Defines project management features like saving and sharing."  
see-also: \["\[\[sprunki-core-features\]\]", "\[\[unit-proj-mgmt-client-storage\]\]", "\[\[unit-proj-mgmt-import-export\]\]"\]  
This feature covers how users save, load, and share their creations.

**Key Aspects:**

* **Client-Side Storage:** \[\[unit-proj-mgmt-client-storage\]\]  
* Import/Export: \[\[unit-proj-mgmt-import-export\]\]  
  :::

::: {unit}  
id: "unit-proj-mgmt-client-storage"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for saving projects in browser local storage."  
Projects (character \+ music \+ animation) can be saved in the browser's local storage for persistence across sessions.  
:::  
::: {unit}  
id: "unit-proj-mgmt-import-export"  
unit-type: "functional-requirement"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Requirement for importing/exporting projects as files."  
Users can export their entire creation as a single file (e.g., JSON) and import such files to load creations made by themselves or others. This is the primary sharing mechanism for a 100% client-side app.  
:::  
::: {composition}  
id: "sprunki-architecture-overview"  
composition-type: "architecture-overview"  
status: "idea"  
version: "0.1"  
brief: "High-level system architecture and technology choices for the Sprunki-like game."  
see-also: \["\[\[sprunki-game-overall-project\]\]", "\[\[unit-tech-core-lang-env\]\]", "\[\[unit-tech-choice-rendering\]\]", "\[\[unit-tech-choice-drawing-lib\]\]", "\[\[unit-tech-choice-audio-engine\]\]", "\[\[unit-tech-choice-animation-logic\]\]", "\[\[unit-tech-choice-ui-framework\]\]", "\[\[unit-tech-choice-data-mgmt\]\]"\]  
This composition outlines the overall technical architecture and identifies key technologies and libraries.

* **Core** Language & **Environment:** \[\[unit-tech-core-lang-env\]\]  
* **Rendering Engine:** \[\[unit-tech-choice-rendering\]\]  
* **Character Drawing & Graphics Manipulation:** \[\[unit-tech-choice-drawing-lib\]\]  
* **Audio Engine:** \[\[unit-tech-choice-audio-engine\]\]  
* **Animation Logic (Interpolation):** \[\[unit-tech-choice-animation-logic\]\]  
* **User Interface (UI) Framework:** \[\[unit-tech-choice-ui-framework\]\]  
* **Data Management & Persistence:** \[\[unit-tech-choice-data-mgmt\]\]

graph TD  
    A\[User\] \--\>|Interacts With| UI\_Framework\[\[unit-tech-choice-ui-framework\]\]  
    UI\_Framework \--\> CharacterEditorModule\[\[feature-character-creator\]\]  
    UI\_Framework \--\> MusicEditorModule\[\[feature-music-loop-creator\]\]  
    UI\_Framework \--\> AnimationEditorModule\[\[feature-animation-system\]\]  
    UI\_Framework \--\> StageModule\[\[feature-performance-stage\]\]

    CharacterEditorModule \--\> DrawingLib\[\[unit-tech-choice-drawing-lib\]\]  
    CharacterEditorModule \--\> CharacterData\[\[unit-char-creator-output-data\]\]  
      
    MusicEditorModule \--\> AudioEngine\[\[unit-tech-choice-audio-engine\]\]  
    MusicEditorModule \--\> MusicData\[\[unit-music-creator-output-data\]\]

    AnimationEditorModule \--\> AnimationLogic\[\[unit-tech-choice-animation-logic\]\]  
    AnimationEditorModule \--\> AnimationData\[\[unit-animation-sys-output-data\]\]  
    AnimationEditorModule \--\> RenderingEngine\_Preview\[\[unit-tech-choice-rendering\]\]

    StageModule \--\> RenderingEngine\_Stage\[\[unit-tech-choice-rendering\]\]  
    StageModule \--\> AudioEngine\_Playback\[\[unit-tech-choice-audio-engine\]\]  
    StageModule \--\> CharacterData  
    StageModule \--\> MusicData  
    StageModule \--\> AnimationData

    DataManager\[\[unit-tech-choice-data-mgmt\]\] \<--\> CharacterData  
    DataManager \<--\> MusicData  
    DataManager \<--\> AnimationData  
    DataManager \<--\> BrowserStorage\[Browser Storage/File API\]

    subgraph "Technology Choices"  
        RenderingEngine  
        DrawingLib  
        AudioEngine  
        AnimationLogic  
        UI\_Framework  
        DataManager  
    end

:::

::: {unit}  
id: "unit-tech-core-lang-env"  
unit-type: "technology-selection"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Core language and runtime environment."  
Technology: HTML, CSS, JavaScript (ES6+).  
Environment: Runs entirely in modern web browsers.  
Rationale: Standard web technologies ensure broad accessibility and client-side execution.  
:::  
::: {unit}  
id: "unit-tech-choice-rendering"  
unit-type: "technology-selection"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Technology choice for the rendering engine."  
Candidate: PixiJS (High-performance 2D WebGL/Canvas renderer).  
Rationale: Excellent for sprite-based animation, visual effects, and managing a scene graph. Handles rendering the character and its animations efficiently.  
Solved Problem Composed: Efficient 2D rendering and scene management.  
:::  
::: {unit}  
id: "unit-tech-choice-drawing-lib"  
unit-type: "technology-selection"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Technology choice for character drawing and graphics manipulation."  
**Candidates:** **Paper.js** or **Fabric.js**.

* **Paper.js:** Strong vector graphics library, good for free-form drawing and path manipulation. Has its own scene graph.  
* Fabric.js: Object model on top of HTML5 canvas, good for manipulating distinct shapes and objects, serialization/deserialization.  
  Rationale: Provides the tools needed for users to draw or assemble character parts. The output (vector data, object properties) will be used by the rendering engine.  
  Solved Problem Composed: Vector drawing capabilities and 2D graphics manipulation.  
  :::

::: {unit}  
id: "unit-tech-choice-audio-engine"  
unit-type: "technology-selection"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Technology choice for the audio engine."  
Candidate: Tone.js.  
Rationale: A powerful Web Audio API framework that simplifies scheduling, synthesis, effects, and managing musical time (tempo, transport). Ideal for the piano roll, instrument implementation, and sample playback.  
Solved Problem Composed: Advanced audio synthesis, sequencing, and effects.  
:::  
::: {unit}  
id: "unit-tech-choice-animation-logic"  
unit-type: "technology-selection"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Technology choice for animation interpolation logic."  
Candidate: Tween.js or a custom interpolation module. (GSAP is powerful but has licensing considerations; Tween.js is simpler and fully open source).  
Rationale: Handles the mathematical calculations for smooth transitions between keyframes.  
Solved Problem Composed: Tweening and animation timing.  
:::  
::: {unit}  
id: "unit-tech-choice-ui-framework"  
unit-type: "technology-selection"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Technology choice for the User Interface (UI) framework."  
Candidates: Vanilla JavaScript with careful componentization, or a lightweight framework like Svelte or Vue.js, or a more comprehensive one like React.  
Rationale: To manage the complexity of multiple editor panels and user interactions. A component-based approach will be beneficial.  
Solved Problem Composed (if framework used): UI component management, state handling, and declarative rendering.  
:::  
::: {unit}  
id: "unit-tech-choice-data-mgmt"  
unit-type: "technology-selection"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Technology choice for data management and persistence."  
Format: JSON for all character, music, and animation data.  
Storage: Browser localStorage or IndexedDB for saving projects.  
Import/Export: JavaScript File API for saving/loading project JSON files.  
Rationale: Standard and browser-native solutions for client-side data handling.  
Solved Problem Composed: Data serialization (JSON) and client-side storage mechanisms.  
:::  
::: {composition}  
id: "sprunki-module-breakdown"  
composition-type: "module-breakdown"  
status: "idea"  
version: "0.1"  
brief: "Logical breakdown of the system into modules and their components."  
see-also: \["\[\[sprunki-game-overall-project\]\]", "\[\[module-app-core\]\]", "\[\[module-character-editor\]\]", "\[\[module-music-editor\]\]", "\[\[module-animation-editor\]\]", "\[\[module-stage\]\]", "\[\[module-data-manager\]\]"\]  
This composition breaks the system into logical modules and defines their responsibilities and interactions.

* \[\[module-app-core\]\]  
* \[\[module-character-editor\]\]  
* \[\[module-music-editor\]\]  
* \[\[module-animation-editor\]\]  
* \[\[module-stage\]\]  
* \[\[module-data-manager\]\]  
  :::

::: {composition}  
id: "module-app-core"  
composition-type: "software-module-specification"  
status: "idea"  
version: "0.1"  
brief: "Specifies the AppCore module, the main orchestrator of the application."  
see-also: \["\[\[sprunki-module-breakdown\]\]"\]  
The AppCore module is responsible for:

* Initializing all other modules.  
* Managing overall application state (e.g., current view: character editor, music editor, etc.).  
* Handling transitions between different editor views and the main stage.  
  :::

::: {composition}  
id: "module-character-editor"  
composition-type: "software-module-specification"  
status: "idea"  
version: "0.1"  
brief: "Specifies the CharacterEditorModule."  
see-also: \["\[\[sprunki-module-breakdown\]\]", "\[\[unit-component-drawing-canvas\]\]", "\[\[unit-component-texture-manager\]\]", "\[\[unit-datastore-character\]\]"\]  
The CharacterEditorModule handles all aspects of character creation.

**Components:**

* \[\[unit-component-drawing-canvas\]\]  
* \[\[unit-component-texture-manager\]\]  
* \[\[unit-datastore-character\]\]  
  :::

::: {unit}  
id: "unit-component-drawing-canvas"  
unit-type: "software-component-definition"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "DrawingCanvasComponent for character creation."  
see-also: \["\[\[module-character-editor\]\]", "\[\[unit-tech-choice-drawing-lib\]\]"\]  
**Responsibilities:**

* Provides drawing tools (pen, shapes, color picker, eraser) using \[\[unit-tech-choice-drawing-lib\]\].  
* Manages character parts as distinct objects or layers.  
* Allows setting pivot points.  
  Interface (Outputs): Character data as JSON (\[\[unit-char-creator-output-data\]\]).  
  :::

::: {unit}  
id: "unit-component-texture-manager"  
unit-type: "software-component-definition"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "TextureManagerComponent for handling character textures."  
see-also: \["\[\[module-character-editor\]\]"\]  
**Responsibilities:**

* Handles \<input type="file"\> for image uploads.  
* Manages a library of loaded textures.  
* Allows applying textures to character parts.  
  Interface (Provides): Texture data/references to \[\[unit-component-drawing-canvas\]\].  
  :::

::: {unit}  
id: "unit-datastore-character"  
unit-type: "data-store-definition"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "CharacterDataStore holds the current character's definition."  
see-also: \["\[\[module-character-editor\]\]", "\[\[unit-char-creator-output-data\]\]"\]  
Holds the current character's definition, conforming to \[\[unit-char-creator-output-data\]\].  
:::  
(Further modules: MusicEditorModule, AnimationEditorModule, StageModule, DataManagerModule would be similarly broken down into compositions and units for their components and data stores. This is omitted for brevity but follows the same pattern.)

::: {composition}  
id: "sprunki-implementation-considerations"  
composition-type: "implementation-considerations"  
status: "idea"  
version: "0.1"  
brief: "Discusses potential challenges and specific implementation details."  
see-also: \["\[\[sprunki-game-overall-project\]\]", "\[\[unit-challenge-char-data-flow\]\]", "\[\[unit-challenge-animation-complexity\]\]", "\[\[unit-challenge-audio-sync\]\]", "\[\[unit-challenge-ui-ux\]\]", "\[\[unit-challenge-performance\]\]", "\[\[unit-challenge-state-mgmt\]\]", "\[\[unit-challenge-undo-redo\]\]", "\[\[unit-challenge-browser-compat\]\]"\]  
This section considers more specific implementation aspects and potential hurdles.

* \[\[unit-challenge-char-data-flow\]\]  
* \[\[unit-challenge-animation-complexity\]\]  
* \[\[unit-challenge-audio-sync\]\]  
* \[\[unit-challenge-ui-ux\]\]  
* \[\[unit-challenge-performance\]\]  
* \[\[unit-challenge-state-mgmt\]\]  
* \[\[unit-challenge-undo-redo\]\]  
* \[\[unit-challenge-browser-compat\]\]  
  :::

::: {unit}  
id: "unit-challenge-char-data-flow"  
unit-type: "implementation-challenge"  
language: "markdown"  
status: "idea"  
version: "0.1"  
brief: "Challenge: Character data flow between drawing and rendering."  
Data from \[\[unit-tech-choice-drawing-lib\]\] (vector paths, object properties) needs a clear translation layer to be usable by \[\[unit-tech-choice-rendering\]\] for rendering (e.g., converting paths to PIXI.Graphics instructions or using SVG assets).  
:::  
(Other challenge units: unit-challenge-animation-complexity, unit-challenge-audio-sync, etc., would be defined here.)

::: {composition}  
id: "sprunki-initial-prototype-plan"  
composition-type: "integration-plan" \# Or "prototype-plan"  
status: "idea"  
version: "0.1"  
brief: "Initial 'Frankenstein' plan for integrating key libraries and building a prototype."  
see-also: \["\[\[sprunki-game-overall-project\]\]", "\[\[sprunki-architecture-overview\]\]"\]  
This plan outlines the initial steps to integrate core libraries and validate the technical approach.

1. **Shell:** Basic HTML structure with divs for each editor and the stage.  
2. **Character Editor Spike:** Integrate \[\[unit-tech-choice-drawing-lib\]\] (e.g., Paper.js) into its dedicated div. Focus on drawing basic shapes and outputting their data as JSON (\[\[unit-char-creator-output-data\]\]).  
3. **Stage Spike:** Integrate \[\[unit-tech-choice-rendering\]\] (PixiJS) into its div. Write a simple parser to take the JSON from the character editor spike and render a static character.  
4. **Music Editor Spike:** Integrate \[\[unit-tech-choice-audio-engine\]\] (Tone.js). Create a basic UI to trigger a Tone.Synth and use Tone.Transport to loop it.  
5. **Animation Editor Spike:** Use \[\[unit-tech-choice-animation-logic\]\] (e.g., Tween.js). Take the PixiJS character from the stage spike and apply a simple tween to one of its properties (e.g., position) based on hardcoded keyframes.  
6. **Data Flow:** Establish the flow of data (primarily JSON) between these core components.  
7. **File I/O:** Implement basic project export (character data \+ music data \+ animation data into one JSON) and import using \[\[unit-tech-choice-data-mgmt\]\].

This layered design, now in MDMD format, provides a more formal roadmap. Starting with spikes for each core library integration will validate the technology choices and uncover integration challenges early