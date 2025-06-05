# Rigged Character System Design

## Core Concept: Parts-Based Character Creation

Instead of drawing complete characters or animation frames, users create **individual body parts** that get automatically assembled into a **riggable character system**. This approach leverages Fabric.js for what it's excellent at (precision drawing) while avoiding its integration challenges.

## Drawing Window: Scratch-Style Interface

### Visual Design
- **Background**: Soft white/grey checkered pattern (classic drawing app aesthetic)
- **Tool Layout**: Classic drawing tools in familiar Scratch-style positions
- **Part-Focused Canvas**: Large drawing area for detailed part creation
- **Responsive Independence**: Drawing window scales properly without stage conflicts

### Part Library Panel (Left Side)
Instead of animation frames, the left panel shows **character parts**:

```
┌─ CHARACTER PARTS ─┐
│ 👤 Head           │
│ 🫁 Torso          │
│ 💪 Left Arm       │
│ 💪 Right Arm      │
│ 👐 Left Hand      │
│ 👐 Right Hand     │
│ 🦵 Left Leg       │
│ 🦵 Right Leg      │
│ 👣 Left Foot      │
│ 👣 Right Foot     │
│ + Add Part        │
└───────────────────┘
```

### Drawing Workflow
1. **Select Part Type**: Click "Head", "Left Arm", etc.
2. **Draw Part**: Use Fabric.js tools to create that specific body part
3. **Auto-Save**: Part automatically saved to library
4. **Preview Assembly**: See how part fits in full character rig
5. **Iterate**: Edit parts independently without affecting others

## Character Rig System

### Hierarchical Structure
```
Character Root
├── Torso (anchor point)
│   ├── Head (attached to top of torso)
│   ├── Left Arm (attached to left shoulder)
│   │   └── Left Hand (attached to arm end)
│   ├── Right Arm (attached to right shoulder)
│   │   └── Right Hand (attached to arm end)
│   ├── Left Leg (attached to bottom left of torso)
│   │   └── Left Foot (attached to leg end)
│   └── Right Leg (attached to bottom right of torso)
│       └── Right Foot (attached to leg end)
```

### Attachment Points
Each part has **predefined attachment points**:
- **Head**: Bottom center (connects to torso top)
- **Torso**: Top center, left/right shoulders, bottom left/right (connections to other parts)
- **Arms**: Shoulder end, hand end
- **Legs**: Hip end, foot end
- **Hands/Feet**: Single attachment point

### Auto-Assembly Logic
When parts are created, the system:
1. **Calculates Attachment Points** based on part geometry
2. **Positions Parts** in hierarchical relationship
3. **Creates Rig Hierarchy** for animation
4. **Updates Stage Display** with assembled character

## Animation System: Keyframe Transforms

### Transform Properties
Each rigged part can be animated via:
- **Rotation**: Rotate arm at shoulder, head turn, etc.
- **Position**: Slight positional offsets for secondary animation
- **Scale**: Size changes for emphasis or squash/stretch

### Timeline Integration
- **Part Selection**: Click character part on stage to select for animation
- **Keyframe Creation**: Timeline records transform state at current time
- **Interpolation**: System interpolates between keyframes
- **Bone Constraints**: Realistic joint limitations (arms don't rotate 360°)

### Humanoid Animation Presets
- **Wave**: Arm rotation sequence
- **Walk Cycle**: Leg alternation with torso bob
- **Head Bob**: Rhythmic head movement to music
- **Dance Moves**: Coordinated full-body sequences

## Technical Implementation

### Data Structure
```javascript
{
  characterId: "sprunki-blue",
  parts: {
    head: { fabricObject: {...}, attachmentPoint: {x: 0, y: -20} },
    torso: { fabricObject: {...}, attachmentPoints: {
      head: {x: 0, y: 20},
      leftArm: {x: -15, y: 10},
      rightArm: {x: 15, y: 10},
      leftLeg: {x: -8, y: -20},
      rightLeg: {x: 8, y: -20}
    }},
    leftArm: { fabricObject: {...}, attachmentPoints: {
      shoulder: {x: 0, y: 0},
      hand: {x: 0, y: -30}
    }},
    // ... other parts
  },
  rig: {
    hierarchy: {/* tree structure */},
    constraints: {/* joint limits */}
  },
  animations: {
    wave: { keyframes: [...] },
    dance: { keyframes: [...] }
  }
}
```

### Component Architecture
1. **PartDrawingCanvas**: Fabric.js canvas for individual part creation
2. **PartLibrary**: Component managing part collection and selection
3. **CharacterRig**: System for assembling parts into animated hierarchy
4. **RigRenderer**: Renders assembled character on performance stage
5. **AnimationController**: Manages keyframe interpolation and playback

## User Experience Flow

### Character Creation
1. **Open Drawing Window**: Dedicated Scratch-style interface
2. **Select "Draw Head"**: Choose specific part to create
3. **Draw with Tools**: Use familiar drawing tools for precise creation
4. **Auto-Assembly**: Head appears positioned on stage character
5. **Continue with Parts**: Draw torso, arms, legs systematically
6. **See Live Updates**: Stage character updates as parts are added

### Animation Authoring  
1. **Select Character Part**: Click arm on stage character
2. **Set Keyframe**: Timeline records current transform state
3. **Move Timeline**: Advance to different time
4. **Transform Part**: Rotate/move arm to new position
5. **Set Next Keyframe**: Timeline records new state
6. **Preview Animation**: Play timeline to see smooth interpolation

### Performance
1. **Multi-Character Stage**: Each character has their rigged parts
2. **Synchronized Animation**: All characters animate their rigs to music
3. **Dynamic Performance**: Keyframed sequences play in ensemble

## Benefits of Rigged Approach

### For Users
- **Familiar Interface**: Scratch-style drawing experience
- **Modular Creation**: Edit parts independently
- **Professional Animation**: Keyframe-based rigging like industry tools
- **Efficient Workflow**: Create once, animate forever

### For Developers  
- **Clean Separation**: Drawing and stage systems independent
- **Scalable Animation**: Add new parts/rigs without rewriting animation system
- **Performance**: Transform-based animation more efficient than frame sequences
- **Extensibility**: Easy to add new part types or animation features

### For System
- **Technical Stability**: Fabric.js in controlled environment
- **Timeline Compatibility**: No conflicts with stage overlay systems
- **Memory Efficiency**: Reuse parts across animation sequences
- **Export Optimization**: Rig data compresses better than frame sequences

## Implementation Phases

### Phase 1: Drawing Window + Part Library
- Create Scratch-style drawing interface
- Implement part selection and library system
- Basic part drawing and saving

### Phase 2: Character Assembly
- Implement rig hierarchy system
- Auto-assembly of parts into characters
- Stage display of rigged characters

### Phase 3: Animation System
- Timeline integration for keyframe creation
- Transform interpolation system
- Part selection and manipulation on stage

### Phase 4: Advanced Features
- Animation presets and templates
- Advanced rig constraints
- Multi-character coordination

This rigged character approach transforms the Open Sprunk Framework into a sophisticated 2D animation system while maintaining the accessibility and creative joy that makes Sprunki special.
