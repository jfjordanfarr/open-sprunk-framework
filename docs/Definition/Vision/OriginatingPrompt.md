Using the Membrane Design approach of progressively concretizing an idea, envision the complete design of an open-source Sprunki-like game which allows players to create their own music loops (simple instruments, piano roll), animations for their Sprunki-like characters (dances, etc., animation should use an interpolation-based system rather than a frame-by-frame animation system). Make sure you are composing solved problems together. There may be open source pieces for the functionality we care about, that we could frankenstein together into an app:
- Game rendering/core engine loop
- Drawing/graphics manipulation for creating your Sprunki-like characters
- Audio generation through predefined MIDI instruments?
- Allowance for user to upload their own images/sounds

The app should be 100% client-side for now. I don't want any of the headache of hosting it or having folks try to push random files to a server I have to steward.

My goal is to create a very simple, web-based, client-side game/interactive experience creation tool, akin to a highly simplified Adobe Animate (Flash) or a visual Scratch, but with a focus on vector graphics and direct HTML5 export. The primary user will be someone who wants to make simple animated cartoons or interactive stories without needing to code extensively, though the output should be inspectable and potentially modifiable by a developer.

This concept is further elaborated in `[[Idea.md]]` and its requirements are captured in documents like `[[../01_REQUIREMENTS/CoreSystemRequirements.mdmd]]`, specifically `[[../01_REQUIREMENTS/client-side-architecture-requirement.mdmd]]` and `[[../01_REQUIREMENTS/html5-export-requirement.mdmd]]`.

## Core Features (Initial Thoughts):