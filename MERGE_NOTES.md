# Merge Conflict Help: Runway Incursion Simulator

If you are seeing merge conflicts with the previous code, the conflicts are likely happening in the main UI files:

- `index.html`
- `styles.css`
- `app.js`

These files were expanded to add the guided DA40/DA20 scenarios, cockpit view, and runway environment panels. Use the steps below to resolve conflicts cleanly.

## Recommended Conflict-Resolution Workflow

1. **Start with your current version of each file** as the base.
2. **Add only the new sections from this branch**:
   - `index.html`: new **Training Scenarios**, **Aircraft Perspective**, and **Runway Environment View** panels.
   - `styles.css`: new styles for `.scene-panel`, `.scene-grid`, `.score-card`, `.callouts`, and the cockpit/sign elements.
   - `app.js`: new guided-scenario data (`guidedScenarios`), cockpit/scene/sign assets (`aircraftData`, `sceneData`, `signAssets`), and the `startGuidedScenario`, `runGuidedStep`, and `advanceGuidedStep` handlers.
3. **Keep existing IDs and classes where possible** to avoid breaking event listeners.

## Quick Manual Merge Checklist

- `index.html`
  - Add the **Aircraft Type** `<select id="aircraftSelect">`.
  - Add the **Training Scenarios** button row (`da40ScenarioBtn`, `da20ScenarioBtn`, `nextStepBtn`).
  - Add the **Aircraft Perspective** panel (`cockpitImage`, `cockpitCaption`).
  - Add the **Runway Environment View** panel (`sceneImage`, `sceneCaption`, `scoreDisplay`, `callouts`).
  - Keep the existing **Taxi Decision Log** (`status`, `locationDisplay`, `options`, `signPrompt`, `signActions`).

- `styles.css`
  - Add the styles for `.scene-panel`, `.scene-grid`, `.scene`, `.score-card`, `.callouts`, `.sign-display`, `.sign-actions`, and `.option-btn`.
  - Keep existing layout/grid rules intact.

- `app.js`
  - Keep your existing `startScenario` and taxi logic.
  - Add the `guidedScenarios` data structure and `startGuidedScenario`/`advanceGuidedStep`.
  - Add `updateScene`, `updateAircraft`, and `updateCallouts`, and call them during initialization.

## If You Want a Faster Merge

If you prefer a quicker path:

1. Keep your `index.html` as-is.
2. Copy only the HTML blocks for **Training Scenarios**, **Aircraft Perspective**, and **Runway Environment View** into your page.
3. Copy the JS additions into `app.js` in three blocks:
   - Data definitions (`sceneData`, `signAssets`, `aircraftData`, `guidedScenarios`)
   - UI update helpers (`updateScene`, `updateAircraft`, `updateCallouts`)
   - Event handlers (`startGuidedScenario`, `runGuidedStep`, `advanceGuidedStep`)

If you want, send me your conflict markers (the `<<<<<<<`, `=======`, `>>>>>>>` blocks) and I can provide a fully resolved version.
