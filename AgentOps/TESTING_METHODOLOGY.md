# Testing Methodology for Open Sprunk Framework

## Correct Testing Workflow

### Current Status
- ✅ **HTTP Server**: Python server running on port 8000
- ✅ **StateManager API Fixes**: All `setState`→`set` and `getState(key)`→`get(key)` conversions completed
- ✅ **JSDoc Enhancement**: Added comprehensive intellisense to core classes
- ✅ **MDMD Back-References**: Added source file links to specification documents

### Testing Process (Corrected)

**User's Role:**
1. Access forwarded port in browser (VS Code Ports tab or provided link)
2. Test specific interactions (mouse clicks, button presses, navigation)
3. Report any console errors or unexpected behavior
4. Provide specific error messages from browser developer console

**GitHub Copilot's Role:**
1. ✅ Start/manage development server
2. ✅ Fix code issues based on user feedback
3. ✅ Implement new features and improvements
4. ❌ **NOT** attempt to "test" browser interactions (no visual access)

### What to Test

**Priority 1: Critical Functionality**
- [ ] **Add Character Button**: Click "Add Character" - should create new character on stage
- [ ] **Mouse Interaction**: Click on characters in Performance Stage - should select them
- [ ] **Canvas Resizing**: Resize browser window - canvas should resize responsively
- [ ] **Navigation**: Switch between Character/Music/Animation/Stage tabs

**Priority 2: State Management**
- [ ] **Character Persistence**: Added characters should remain after navigation
- [ ] **Selection State**: Selected character should stay selected across operations
- [ ] **Project Data**: Verify test data (3 Sprunki characters) loads correctly

**Priority 3: Console Output**
- [ ] **Error Reporting**: Check browser console for JavaScript errors
- [ ] **Event Flow**: Verify EventBus communications in console logs
- [ ] **State Updates**: Confirm StateManager operations complete successfully

### How to Report Issues

**Format for Error Reports:**
```
Issue: [Brief description]
Location: [Which UI element/interaction]
Console Error: [Exact error message from browser console]
Steps to Reproduce: [Specific steps that cause the issue]
```

**Example Good Report:**
```
Issue: Add Character button doesn't work
Location: Performance Stage tab, "Add Character" button
Console Error: TypeError: Cannot read property 'push' of undefined at main.js:259
Steps to Reproduce: 1) Open app, 2) Go to Stage tab, 3) Click "Add Character"
```

### Code Quality Improvements Applied

**JSDoc Intellisense Added:**
- ✅ StateManager: Comprehensive method documentation with examples
- ✅ EventBus: Event patterns and usage examples  
- ✅ AppCore: Module management and initialization
- ✅ PerformanceStage: Canvas and interaction documentation

**MDMD Back-References Added:**
- ✅ All core classes now reference their specification documents
- ✅ Enables easy navigation from code to documentation
- ✅ Maintains traceability between implementation and design

## Next Steps

1. **User Testing**: Access http://localhost:8000 via forwarded port and test functionality
2. **Issue Reporting**: Report any problems using the format above
3. **Iterative Fixes**: GitHub Copilot will fix issues based on feedback
4. **Feature Development**: Once core functionality works, add new features
