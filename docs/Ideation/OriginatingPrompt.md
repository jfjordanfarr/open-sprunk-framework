Using the Membrane Design approach of progressively concretizing an idea, envision the complete design of an open-source Sprunki-like game which allows players to create their own music loops (simple instruments, piano roll), animations for their Sprunki-like characters (dances, etc., animation should use an interpolation-based system rather than a frame-by-frame animation system). Make sure you are composing solved problems together. There may be open source pieces for the functionality we care about, that we could frankenstein together into an app:
- Game rendering/core engine loop
- Drawing/graphics manipulation for creating your Sprunki-like characters
- Audio generation through predefined MIDI instruments?
- Allowance for user to upload their own images/sounds

The app should be 100% client-side for now. I don't want any of the headache of hosting it or having folks try to push random files to a server I have to steward.