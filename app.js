let startBtn;
let resetBtn;
let statusEl;
let locationDisplay;
let optionsEl;
let signPrompt;
let signActions;
let signImage;
let sceneImage;
let sceneCaption;
let scoreDisplay;
let logEntries;
let callouts;
let cockpitImage;
let cockpitCaption;
let da40ScenarioBtn;
let da20ScenarioBtn;
let nextStepBtn;
let jsStatus;

let airportSelect;
let clearanceSelect;
let focusSelect;
let aircraftSelect;

const airportNodes = {
  Ramp: {
    options: [
      { label: "Taxi to Taxiway A", next: "Taxiway A" },
      { label: "Request progressive taxi", next: "Progressive" },
    ],
  },
  "Taxiway A": {
    options: [
      { label: "Continue to Runway 27 hold short", next: "Hold Short 27" },
      { label: "Turn to Taxiway B", next: "Taxiway B" },
      { label: "Stop and verify signage", next: "Taxiway A" },
    ],
    sign: { text: "A →", answer: "directional" },
  },
  "Taxiway B": {
    options: [
      { label: "Proceed to Runway 18 hold short", next: "Hold Short 18" },
      { label: "Return to Taxiway A", next: "Taxiway A" },
    ],
    sign: { text: "B" , answer: "location" },
  },
  Progressive: {
    options: [
      { label: "Follow progressive instruction to Taxiway C", next: "Taxiway C" },
      { label: "Stay at ramp and clarify", next: "Ramp" },
    ],
  },
  "Taxiway C": {
    options: [
      { label: "Proceed to Runway 27 hold short", next: "Hold Short 27" },
      { label: "Taxi back to Ramp", next: "Ramp" },
    ],
    sign: { text: "C | 27-9", answer: "directional" },
  },
  "Hold Short 27": {
    options: [
      { label: "Hold short and contact tower", next: "Hold Short 27" },
      { label: "Cross Runway 27 after clearance", next: "Runway 27" },
      { label: "Taxi to Runway 18 hold short", next: "Hold Short 18" },
    ],
    sign: { text: "27-9" , answer: "runway" },
  },
  "Hold Short 18": {
    options: [
      { label: "Hold short and verify clearance", next: "Hold Short 18" },
      { label: "Cross Runway 18 with clearance", next: "Runway 18" },
      { label: "Taxi back to Taxiway B", next: "Taxiway B" },
    ],
    sign: { text: "18-36" , answer: "runway" },
  },
  "Runway 27": {
    options: [
      { label: "Exit via Taxiway A", next: "Taxiway A" },
      { label: "Exit via Taxiway C", next: "Taxiway C" },
    ],
  },
  "Runway 18": {
    options: [
      { label: "Exit via Taxiway B", next: "Taxiway B" },
      { label: "Exit via Taxiway C", next: "Taxiway C" },
    ],
  },
};

const sceneData = {
  day_vfr: {
    src: "assets/scene-day.svg",
    caption: "Day VFR: high visibility, taxiway centerline clearly visible.",
  },
  night_vfr: {
    src: "assets/scene-night.svg",
    caption: "Night VFR: rely on lighting, verify hold short signs carefully.",
  },
  imc: {
    src: "assets/scene-imc.svg",
    caption: "IMC: reduced visibility, prioritize progressive taxi and signage.",
  },
};

const signAssets = {
  location: { src: "assets/sign-location.svg", label: "Location sign" },
  directional: { src: "assets/sign-directional.svg", label: "Directional sign" },
  runway: { src: "assets/sign-runway.svg", label: "Runway hold short sign" },
};

const aircraftData = {
  da40: {
    src: "assets/cockpit-da40.svg",
    caption: "DA40: verify taxi clearance, set lights, and check brakes.",
  },
  da20: {
    src: "assets/cockpit-da20.svg",
    caption: "DA20: scan for traffic, confirm heading indicator, and monitor brakes.",
  },
};

const guidedScenarios = {
  da40Standard: {
    label: "DA40 Ramp → Runway → Ramp",
    aircraft: "da40",
    airport: "day_vfr",
    clearance: "to_runway",
    focus: "mixed",
    steps: [
      {
        location: "Ramp",
        status: "Brake check complete. Taxi briefing reviewed.",
        action: "Crew: brakes checked, lights on, taxi briefing complete.",
        scoreDelta: 1,
      },
      {
        location: "Taxiway A",
        status: "Taxi via A. Confirm directional signage.",
        action: "Taxi to Taxiway A.",
      },
      {
        location: "Hold Short 27",
        status: "Hold short Runway 27. Verify clearance.",
        action: "Hold short line reached; tower contacted.",
        scoreDelta: 1,
      },
      {
        location: "Runway 27",
        status: "Cleared to cross Runway 27. Maintain centerline.",
        action: "Crossed Runway 27 with clearance.",
        scoreDelta: 2,
      },
      {
        location: "Taxiway A",
        status: "Exit runway and taxi back toward ramp.",
        action: "Exited runway via Taxiway A.",
      },
      {
        location: "Ramp",
        status: "Taxi complete. Secure aircraft.",
        action: "Returned to ramp and completed after-taxi flow.",
        scoreDelta: 2,
      },
    ],
  },
  da20Progressive: {
    label: "DA20 Progressive Taxi",
    aircraft: "da20",
    airport: "imc",
    clearance: "progressive",
    focus: "incursion",
    steps: [
      {
        location: "Ramp",
        status: "Request progressive taxi from ground.",
        action: "Requested progressive taxi due to IMC.",
        scoreDelta: 2,
      },
      {
        location: "Taxiway C",
        status: "Follow progressive taxi to Taxiway C.",
        action: "Following ground instructions to Taxiway C.",
      },
      {
        location: "Hold Short 18",
        status: "Hold short Runway 18 and read back clearance.",
        action: "Holding short Runway 18.",
        scoreDelta: 2,
      },
      {
        location: "Runway 18",
        status: "Cross Runway 18 with clearance and monitor traffic.",
        action: "Crossed Runway 18 with clearance.",
        scoreDelta: 2,
      },
      {
        location: "Taxiway C",
        status: "Exit runway and taxi back to ramp per progressive.",
        action: "Exited runway via Taxiway C.",
      },
      {
        location: "Ramp",
        status: "Progressive taxi complete. Secure aircraft.",
        action: "Returned to ramp and completed checklist.",
        scoreDelta: 2,
      },
    ],
  },
};

const signOptions = [
  { label: "Location sign", value: "location" },
  { label: "Directional sign", value: "directional" },
  { label: "Runway hold short sign", value: "runway" },
];

let currentLocation = "Ramp";
let scenarioActive = false;
let score = 0;
let guidedActive = false;
let currentGuidedScenario = null;
let currentStepIndex = 0;
const AUTO_START_ON_LOAD = true;

const updateStatus = (message) => {
  if (!statusEl) return;
  statusEl.textContent = message;
};

const updateLocation = (location) => {
  if (!locationDisplay) return;
  locationDisplay.textContent = location;
};

const updateScore = (delta) => {
  score += delta;
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }
};

const addLogEntry = (message) => {
  if (!logEntries) return;
  const entry = document.createElement("li");
  entry.textContent = message;
  if (typeof logEntries.prepend === "function") {
    logEntries.prepend(entry);
  } else {
    logEntries.insertBefore(entry, logEntries.firstChild);
  }
};

const updateScene = () => {
  if (!sceneImage || !sceneCaption || !airportSelect) return;
  const scene = sceneData[airportSelect.value];
  if (!scene) return;
  sceneImage.src = scene.src;
  sceneImage.alt = scene.caption;
  sceneCaption.textContent = scene.caption;
};

const updateAircraft = () => {
  if (!cockpitImage || !cockpitCaption || !aircraftSelect) return;
  const aircraft = aircraftData[aircraftSelect.value];
  if (!aircraft) return;
  cockpitImage.src = aircraft.src;
  cockpitImage.alt = aircraft.caption;
  cockpitCaption.textContent = aircraft.caption;
};

const updateCallouts = () => {
  if (!callouts || !focusSelect) return;
  callouts.innerHTML = "";
  const focus = focusSelect.value;
  const focusMessages = {
    signs: [
      { tone: "safe", text: "Focus: confirm location signs at each intersection." },
      { tone: "caution", text: "Call out directional signs before turning." },
    ],
    incursion: [
      { tone: "danger", text: "Hold short until cleared across every runway." },
      { tone: "caution", text: "Stop if unsure about your clearance." },
    ],
    mixed: [
      { tone: "safe", text: "Identify signs and verify your position before moving." },
      { tone: "caution", text: "Brief each runway crossing out loud." },
    ],
  };

  focusMessages[focus].forEach((message) => {
    const div = document.createElement("div");
    div.className = `callout ${message.tone}`;
    div.textContent = message.text;
    callouts.appendChild(div);
  });
};

const renderOptions = (location) => {
  if (!optionsEl) return;
  optionsEl.innerHTML = "";
  if (guidedActive) {
    const note = document.createElement("div");
    note.className = "status";
    note.textContent = "Guided scenario active. Use “Next Step” to advance.";
    optionsEl.appendChild(note);
    return;
  }
  const node = airportNodes[location];
  if (!node) return;
  node.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.textContent = option.label;
    button.addEventListener("click", () => handleMove(option));
    optionsEl.appendChild(button);
  });
};

const renderSignPrompt = (location) => {
  if (!signActions || !signPrompt || !signImage) return;
  signActions.innerHTML = "";
  const node = airportNodes[location];
  if (!node || !node.sign) {
    signPrompt.textContent = "No sign required at this location.";
    signImage.src = "assets/sign-location.svg";
    signImage.alt = "Taxiway sign";
    return;
  }

  signPrompt.textContent = node.sign.text;
  const asset = signAssets[node.sign.answer];
  if (asset) {
    signImage.src = asset.src;
    signImage.alt = asset.label;
  }
  signOptions.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option.label;
    button.addEventListener("click", () => handleSignCheck(option.value, node.sign.answer));
    signActions.appendChild(button);
  });
};

const handleSignCheck = (choice, correct) => {
  if (choice === correct) {
    updateStatus("Correct sign ID. Maintain situational awareness and continue taxi.");
    updateScore(2);
    addLogEntry("Sign verified correctly.");
  } else {
    updateStatus("Incorrect sign ID. Stop the aircraft and re-evaluate signage before proceeding.");
    updateScore(-2);
    addLogEntry("Sign mismatch detected. Taxi paused.");
  }
};

const handleMove = (option) => {
  if (!scenarioActive) return;

  if (option.next.startsWith("Runway") && !updateRunwayClearance(option.next)) {
    updateStatus("Hold short! You attempted to enter a runway without clearance.");
    updateScore(-5);
    addLogEntry("Runway incursion prevented. Clearance missing.");
    return;
  }

  addLogEntry(`Taxi instruction: ${option.label}.`);
  currentLocation = option.next;
  updateLocation(currentLocation);
  renderOptions(currentLocation);
  renderSignPrompt(currentLocation);
  updateStatus(`Taxiing to ${currentLocation}. Monitor signage and taxiway markings.`);
};

const updateRunwayClearance = (next) => {
  if (!clearanceSelect) return true;
  const clearance = clearanceSelect.value;
  if (clearance === "to_runway") {
    return true;
  }
  if (clearance === "via_alpha" && next === "Runway 27") {
    return false;
  }
  if (clearance === "progressive" && next.startsWith("Runway")) {
    return false;
  }
  return true;
};

const startScenario = () => {
  scenarioActive = true;
  guidedActive = false;
  currentGuidedScenario = null;
  currentStepIndex = 0;
  if (nextStepBtn) {
    nextStepBtn.disabled = true;
  }
  currentLocation = "Ramp";
  score = 0;
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }
  if (logEntries) {
    logEntries.innerHTML = "";
  }
  updateLocation(currentLocation);
  renderOptions(currentLocation);
  renderSignPrompt(currentLocation);
  updateScene();
  updateCallouts();
  updateAircraft();

  if (airportSelect && clearanceSelect && focusSelect) {
    const airport = airportSelect.options[airportSelect.selectedIndex].textContent;
    const clearance = clearanceSelect.options[clearanceSelect.selectedIndex].textContent;
    const focus = focusSelect.options[focusSelect.selectedIndex].textContent;
    updateStatus(`Scenario active: ${airport}. Clearance: ${clearance}. Focus: ${focus}.`);
    addLogEntry(`Scenario started: ${airport}.`);
    addLogEntry(`Clearance: ${clearance}.`);
  }
};

const startGuidedScenario = (scenarioKey) => {
  const scenario = guidedScenarios[scenarioKey];
  if (!scenario) return;

  scenarioActive = true;
  guidedActive = true;
  currentGuidedScenario = scenario;
  currentStepIndex = 0;
  if (nextStepBtn) {
    nextStepBtn.disabled = false;
  }

  if (aircraftSelect) {
    aircraftSelect.value = scenario.aircraft;
  }
  if (airportSelect) {
    airportSelect.value = scenario.airport;
  }
  if (clearanceSelect) {
    clearanceSelect.value = scenario.clearance;
  }
  if (focusSelect) {
    focusSelect.value = scenario.focus;
  }

  score = 0;
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }
  if (logEntries) {
    logEntries.innerHTML = "";
  }
  updateScene();
  updateCallouts();
  updateAircraft();

  addLogEntry(`Guided scenario: ${scenario.label}.`);
  runGuidedStep();
};

const runGuidedStep = () => {
  if (!currentGuidedScenario) return;
  const step = currentGuidedScenario.steps[currentStepIndex];
  if (!step) {
    updateStatus("Scenario complete. Debrief and review your taxi performance.");
    if (nextStepBtn) {
      nextStepBtn.disabled = true;
    }
    addLogEntry("Scenario complete.");
    guidedActive = false;
    return;
  }

  currentLocation = step.location;
  updateLocation(currentLocation);
  renderOptions(currentLocation);
  renderSignPrompt(currentLocation);
  updateStatus(step.status);
  addLogEntry(step.action);
  if (step.scoreDelta) {
    updateScore(step.scoreDelta);
  }
};

const advanceGuidedStep = () => {
  if (!guidedActive || !currentGuidedScenario) return;
  currentStepIndex += 1;
  runGuidedStep();
};

const resetScenario = () => {
  scenarioActive = false;
  guidedActive = false;
  currentGuidedScenario = null;
  currentStepIndex = 0;
  if (nextStepBtn) {
    nextStepBtn.disabled = true;
  }
  currentLocation = "Ramp";
  score = 0;
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }
  updateLocation(currentLocation);
  if (optionsEl) {
    optionsEl.innerHTML = "";
  }
  if (signActions) {
    signActions.innerHTML = "";
  }
  if (signPrompt) {
    signPrompt.textContent = "Sign will appear here.";
  }
  if (signImage) {
    signImage.src = "assets/sign-location.svg";
    signImage.alt = "Taxiway sign";
  }
  if (logEntries) {
    logEntries.innerHTML = "";
  }
  if (callouts) {
    callouts.innerHTML = "";
  }
  updateStatus("Select a scenario and start to begin taxiing.");
};

const initSimulator = () => {
  startBtn = document.getElementById("startBtn");
  resetBtn = document.getElementById("resetBtn");
  statusEl = document.getElementById("status");
  locationDisplay = document.getElementById("locationDisplay");
  optionsEl = document.getElementById("options");
  signPrompt = document.getElementById("signPrompt");
  signActions = document.getElementById("signActions");
  signImage = document.getElementById("signImage");
  sceneImage = document.getElementById("sceneImage");
  sceneCaption = document.getElementById("sceneCaption");
  scoreDisplay = document.getElementById("scoreDisplay");
  logEntries = document.getElementById("logEntries");
  callouts = document.getElementById("callouts");
  cockpitImage = document.getElementById("cockpitImage");
  cockpitCaption = document.getElementById("cockpitCaption");
  da40ScenarioBtn = document.getElementById("da40ScenarioBtn");
  da20ScenarioBtn = document.getElementById("da20ScenarioBtn");
  nextStepBtn = document.getElementById("nextStepBtn");
  jsStatus = document.getElementById("jsStatus");

  airportSelect = document.getElementById("airportSelect");
  clearanceSelect = document.getElementById("clearanceSelect");
  focusSelect = document.getElementById("focusSelect");
  aircraftSelect = document.getElementById("aircraftSelect");

  if (startBtn) {
    startBtn.addEventListener("click", startScenario);
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", resetScenario);
  }
  if (airportSelect) {
    airportSelect.addEventListener("change", updateScene);
  }
  if (focusSelect) {
    focusSelect.addEventListener("change", updateCallouts);
  }
  if (aircraftSelect) {
    aircraftSelect.addEventListener("change", updateAircraft);
  }
  if (da40ScenarioBtn) {
    da40ScenarioBtn.addEventListener("click", () => startGuidedScenario("da40Standard"));
  }
  if (da20ScenarioBtn) {
    da20ScenarioBtn.addEventListener("click", () => startGuidedScenario("da20Progressive"));
  }
  if (nextStepBtn) {
    nextStepBtn.addEventListener("click", advanceGuidedStep);
  }

  updateScene();
  updateCallouts();
  updateAircraft();
  updateStatus("Ready. Choose a scenario and click Start Scenario to begin.");
  if (jsStatus) {
    jsStatus.textContent = "Simulator status: active";
    jsStatus.classList.add("ready");
  }
  if (AUTO_START_ON_LOAD) {
    startScenario();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSimulator);
} else {
  initSimulator();
}

window.addEventListener("error", () => {
  if (!jsStatus) return;
  jsStatus.textContent = "Simulator status: error (check console)";
  jsStatus.classList.add("error");
});
