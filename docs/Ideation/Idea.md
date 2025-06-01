# **Sprunki-like Game: Design Document**

## **Layer 0: Core Idea & Vision (The "Why")**

**Vision:** To create a delightful, 100% client-side, open-source creative game where users can design unique "Sprunki-like" characters, compose their own music loops, and bring their creations to life with custom animations. The experience should foster self-expression, playful experimentation, and the ability to easily save and share creations (via file export/import).

**Inspiration:** Drawing inspiration from the creature customization of games like Spore, the musical creativity of loop-based music software, and the charm of character-driven virtual toys. The key is accessibility and immediate creative feedback, all within the browser.

**Core Tenets:**

* **User Creation Focused:** The primary gameplay is the act of creating.  
* **Client-Side Simplicity:** No server-side dependencies for core functionality, ensuring ease of use and distribution.  
* **Open Source & Modular:** Built with extensibility in mind, leveraging existing open-source components.  
* **Interpolation-Based Animation:** Smooth, procedural animation rather than frame-by-frame drawing for animations.

## **Layer 1: Core User Experience & Key Features (The "What")**

This layer defines the primary interactions and capabilities users will have.

1. **Character Creator:**  
   * **Interface:** A dedicated module for designing Sprunki characters.  
   * **Drawing/Assembly:** Users can draw custom vector shapes (e.g., body, limbs, eyes) or assemble characters from a library of primitive shapes.  
   * **Customization:** Tools for coloring, scaling, rotating, and arranging parts.  
   * **Texture Support:** Ability to apply colors, gradients, or user-uploaded images as textures to character parts.  
   * **Pivot Points:** Users can define pivot points on character parts for articulation during animation.  
   * **Output:** Character data (vector information, texture references, pivot points, part hierarchy).  
2. **Music Loop Creator:**  
   * **Interface:** A dedicated module for composing music.  
   * **Piano Roll:** A visual interface for placing and editing notes over a timeline.  
   * **Instruments:** A selection of simple, pre-defined synthesized instruments (e.g., sine wave synth, square wave lead, simple percussion) powered by the Web Audio API.  
   * **Sample Support:** Ability for users to upload their own short sound samples (e.g., a vocal snippet, a custom drum sound) to be triggered in the loop.  
   * **Loop Controls:** Set tempo (BPM), loop length (e.g., 4, 8, 16 beats), and time signature.  
   * **Output:** Music loop data (note sequences, instrument choices, sample references, tempo).  
3. **Animation System:**  
   * **Interface:** A dedicated module for animating the created character.  
   * **Timeline-Based Keyframing:** Users set keyframes on a timeline for various properties of character parts (position, rotation, scale).  
   * **Interpolation:** The system automatically generates smooth transitions between keyframes using interpolation methods (e.g., linear, ease-in, ease-out).  
   * **Character Preview:** A live preview of the character performing the animation.  
   * **Animation Library (Optional):** Pre-defined animation snippets (e.g., simple dance moves, idle animations) that users can apply and customize.  
   * **Output:** Animation data (keyframe information for each part, timing, interpolation types).  
4. **Performance Stage:**  
   * **Interface:** The main view where the character, its animation, and the music loop come together.  
   * **Synchronization:** Animations are synchronized with the music loop.  
   * **Backgrounds:** Simple customizable backgrounds (solid colors, gradients, or user-uploaded images).  
5. **Project Management & Sharing:**  
   * **Client-Side Storage:** Projects (character \+ music \+ animation) can be saved in the browser's local storage for persistence across sessions.  
   * **Import/Export:** Users can export their entire creation as a single file (e.g., JSON) and import such files to load creations made by themselves or others. This is the primary sharing mechanism for a 100% client-side app.

## **Layer 2: System Architecture & Technology Choices (The "How" \- Broad Strokes)**

This layer outlines the overall technical architecture and identifies key technologies and libraries.

* **Core Language & Environment:**  
  * HTML, CSS, JavaScript (ES6+).  
  * Runs entirely in modern web browsers.  
* **Rendering Engine (for Character Display & Animation on Stage):**  
  * **Candidate:** **PixiJS** (High-performance 2D WebGL/Canvas renderer).  
  * **Rationale:** Excellent for sprite-based animation, visual effects, and managing a scene graph. Handles rendering the character and its animations efficiently.  
  * *Solved Problem Composed:* Efficient 2D rendering and scene management.  
* **Character Drawing & Graphics Manipulation (in Character Creator):**  
  * **Candidate:** **Paper.js** or **Fabric.js**.  
    * **Paper.js:** Strong vector graphics library, good for free-form drawing and path manipulation. Has its own scene graph.  
    * **Fabric.js:** Object model on top of HTML5 canvas, good for manipulating distinct shapes and objects, serialization/deserialization.  
  * **Rationale:** Provides the tools needed for users to draw or assemble character parts. The output (vector data, object properties) will be used by the rendering engine.  
  * *Solved Problem Composed:* Vector drawing capabilities and 2D graphics manipulation.  
* **Audio Engine (for Music Loop Creator & Playback):**  
  * **Candidate:** **Tone.js**.  
  * **Rationale:** A powerful Web Audio API framework that simplifies scheduling, synthesis, effects, and managing musical time (tempo, transport). Ideal for the piano roll, instrument implementation, and sample playback.  
  * *Solved Problem Composed:* Advanced audio synthesis, sequencing, and effects.  
* **Animation Logic (Interpolation):**  
  * **Candidate:** **Tween.js** or a custom interpolation module. GSAP is powerful but has licensing considerations for some commercial uses; Tween.js is simpler and fully open source.  
  * **Rationale:** Handles the mathematical calculations for smooth transitions between keyframes.  
  * *Solved Problem Composed:* Tweening and animation timing.  
* **User Interface (UI) Framework:**  
  * **Candidate:** Vanilla JavaScript with careful componentization, or a lightweight framework like **Svelte** or **Vue.js**, or a more comprehensive one like **React**.  
  * **Rationale:** To manage the complexity of multiple editor panels and user interactions. A component-based approach will be beneficial.  
  * *Solved Problem Composed (if framework used):* UI component management, state handling, and declarative rendering.  
* **Data Management & Persistence:**  
  * **Format:** JSON for all character, music, and animation data.  
  * **Storage:** Browser localStorage or IndexedDB for saving projects.  
  * **Import/Export:** JavaScript File API for saving/loading project JSON files.  
  * *Solved Problem Composed:* Data serialization (JSON) and client-side storage mechanisms.

## **Layer 3: Component Breakdown & Interfaces (The "How" \- Detailed)**

This layer breaks the system into logical modules and defines their responsibilities and interactions.

1. **AppCore (Main Orchestrator):**  
   * Initializes all modules.  
   * Manages overall application state (e.g., current view: character editor, music editor, etc.).  
   * Handles transitions between different editor views and the main stage.  
2. **CharacterEditorModule:**  
   * **DrawingCanvasComponent (using Paper.js/Fabric.js):**  
     * Provides drawing tools (pen, shapes, color picker, eraser).  
     * Manages character parts as distinct objects or layers.  
     * Allows setting pivot points.  
     * *Interface:* Outputs character data (JSON describing parts, shapes, colors, pivots).  
   * **TextureManagerComponent:**  
     * Handles \<input type="file"\> for image uploads.  
     * Manages a library of loaded textures.  
     * Allows applying textures to character parts.  
     * *Interface:* Provides texture data/references to DrawingCanvasComponent.  
   * **CharacterDataStore:**  
     * Holds the current character's definition.  
3. **MusicEditorModule:**  
   * **PianoRollComponent (HTML/CSS/JS \+ Tone.js):**  
     * Visual grid for note input and editing.  
     * Controls for note properties (pitch, duration, velocity).  
     * *Interface:* Outputs note data for the sequencer.  
   * **InstrumentSelectorComponent (HTML/CSS/JS \+ Tone.js):**  
     * Allows selection from predefined Tone.Synth instances or user-uploaded samples.  
     * *Interface:* Configures the sound source for notes.  
   * **SampleUploaderComponent (HTML/CSS/JS \+ Tone.js):**  
     * Handles \<input type="file"\> for audio sample uploads.  
     * Creates Tone.Player or Tone.Sampler instances.  
     * *Interface:* Adds custom samples to available instruments.  
   * **SequencerComponent (using Tone.js):**  
     * Manages Tone.Transport for tempo and looping.  
     * Schedules notes from PianoRollComponent using Tone.Part or Tone.Sequence.  
     * *Interface:* Controls music playback; outputs music loop data (JSON).  
   * **MusicDataStore:**  
     * Holds the current music loop's definition.  
4. **AnimationEditorModule:**  
   * **CharacterPreviewComponent (using PixiJS):**  
     * Renders the current character based on CharacterDataStore.  
     * Updates in real-time as animation is applied.  
   * **TimelineComponent (HTML/CSS/JS):**  
     * Visual representation of time and keyframes for selected character parts.  
     * Allows adding, deleting, and modifying keyframes.  
   * **PropertyEditorComponent (HTML/CSS/JS):**  
     * Displays and allows editing of animatable properties (x, y, rotation, scale) for a selected keyframe.  
   * **AnimationEngineComponent (using Tween.js or custom logic):**  
     * Takes keyframe data from TimelineComponent.  
     * Calculates interpolated values for properties between keyframes.  
     * Updates the CharacterPreviewComponent.  
     * *Interface:* Outputs animation data (JSON).  
   * **AnimationDataStore:**  
     * Holds the current animation's definition.  
5. **StageModule (Main Performance View):**  
   * **StageRendererComponent (using PixiJS):**  
     * Renders the character(s) using data from CharacterDataStore.  
     * Applies animations from AnimationDataStore via the AnimationEngineComponent.  
     * Renders background.  
   * **StageAudioPlayerComponent (using Tone.js):**  
     * Plays the music loop from MusicDataStore via the SequencerComponent.  
     * Ensures synchronization with Tone.Transport.  
6. **DataManagerModule:**  
   * **ProjectSerializer:**  
     * Collects data from CharacterDataStore, MusicDataStore, and AnimationDataStore.  
     * Serializes to a single JSON object for export or saving.  
     * Deserializes JSON to populate the data stores on import.  
   * **LocalStorageManager:**  
     * Saves/loads serialized project data to/from browser localStorage or IndexedDB.  
   * **FileIOManager:**  
     * Handles browser file dialogs for importing/exporting project JSON files.

## **Layer 4: Implementation Details & Potential Challenges (The "Grit")**

This layer considers more specific implementation aspects and potential hurdles.

* **Character Data Flow:**  
  * Data from Paper.js/Fabric.js (vector paths, object properties) needs a clear translation layer to be usable by PixiJS for rendering (e.g., converting paths to PIXI.Graphics instructions or using SVG assets).  
* **Animation System Complexity:**  
  * Managing a hierarchy of character parts (e.g., arm attached to torso) and applying transformations correctly (local vs. global coordinates).  
  * Implementing intuitive controls for selecting parts and editing their animation properties.  
* **Audio Synchronization Precision:**  
  * Tone.js greatly helps, but ensuring animations feel perfectly "on beat" with audio events requires careful use of Tone.Transport and its scheduling capabilities.  
* **UI/UX Design:**  
  * Creating three distinct yet cohesive editor interfaces (character, music, animation) that are intuitive for users.  
  * Managing screen real estate effectively.  
* **Performance:**  
  * Complex vector characters, numerous tweens, and Web Audio processing can be demanding. Optimizations will be necessary, especially for PixiJS rendering and animation updates.  
  * Efficient handling of user-uploaded assets (image compression, audio buffer management).  
* **State Management:**  
  * Keeping the state of the character, music, and animation consistent across different modules and views. A clear state management pattern (even if simple for vanilla JS) or a library's built-in solution will be crucial.  
* **Undo/Redo Functionality:**  
  * Highly desirable in creative applications. This would require a command pattern or similar mechanism to track changes in each editor.  
* **Browser Compatibility:**  
  * Ensuring consistent behavior across modern browsers for WebGL, Web Audio API, File API, and localStorage/IndexedDB.

**Initial Frankenstein Plan \- Key Library Integrations:**

1. **Shell:** Basic HTML structure with divs for each editor and the stage.  
2. **Character Editor:** Integrate **Paper.js** or **Fabric.js** into its dedicated div. Focus on drawing basic shapes and outputting their data as JSON.  
3. **Stage:** Integrate **PixiJS** into its div. Write a simple parser to take the JSON from the character editor and render a static character.  
4. **Music Editor:** Integrate **Tone.js**. Create a basic UI to trigger a Tone.Synth and use Tone.Transport to loop it.  
5. **Animation Editor:** Use **Tween.js**. Take the PixiJS character and apply a simple tween to one of its properties (e.g., position) based on hardcoded keyframes.  
6. **Data Flow:** Establish the flow of data (primarily JSON) between these core components.  
7. **File I/O:** Implement basic project export (character data \+ music data \+ animation data into one JSON) and import.

This layered design provides a roadmap. Starting with spikes for each core library integration (as outlined in the "Frankenstein Plan") will validate the technology choices and uncover integration challenges early. The 100% client-side constraint simplifies deployment but puts all the onus of performance and data handling on the browser.