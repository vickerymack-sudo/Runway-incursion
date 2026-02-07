const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("status");
const locationDisplay = document.getElementById("locationDisplay");
const optionsEl = document.getElementById("options");
const signPrompt = document.getElementById("signPrompt");
const signActions = document.getElementById("signActions");
const signImage = document.getElementById("signImage");
const sceneImage = document.getElementById("sceneImage");
const sceneCaption = document.getElementById("sceneCaption");
const scoreDisplay = document.getElementById("scoreDisplay");
const logEntries = document.getElementById("logEntries");
const callouts = document.getElementById("callouts");
const cockpitImage = document.getElementById("cockpitImage");
const cockpitCaption = document.getElementById("cockpitCaption");
const da40ScenarioBtn = document.getElementById("da40ScenarioBtn");
const da20ScenarioBtn = document.getElementById("da20ScenarioBtn");
const nextStepBtn = document.getElementById("nextStepBtn");

const airportSelect = document.getElementById("airportSelect");
const clearanceSelect = document.getElementById("clearanceSelect");
const focusSelect = document.getElementById("focusSelect");
const aircraftSelect = document.getElementById("aircraftSelect");

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

const updateStatus = (message) => {
  statusEl.textContent = message;
};

const updateLocation = (location) => {
  locationDisplay.textContent = location;
};

const updateScore = (delta) => {
  score += delta;
  scoreDisplay.textContent = score;
};

const addLogEntry = (message) => {
  const entry = document.createElement("li");
  entry.textContent = message;
  logEntries.prepend(entry);
};

const updateScene = () => {
  const scene = sceneData[airportSelect.value];
  sceneImage.src = scene.src;
  sceneImage.alt = scene.caption;
  sceneCaption.textContent = scene.caption;
};

const updateAircraft = () => {
  const aircraft = aircraftData[aircraftSelect.value];
  cockpitImage.src = aircraft.src;
  cockpitImage.alt = aircraft.caption;
  cockpitCaption.textContent = aircraft.caption;
};

const updateCallouts = () => {
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
  signImage.src = asset.src;
  signImage.alt = asset.label;
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
  nextStepBtn.disabled = true;
  currentLocation = "Ramp";
  score = 0;
  scoreDisplay.textContent = score;
  logEntries.innerHTML = "";
  updateLocation(currentLocation);
  renderOptions(currentLocation);
  renderSignPrompt(currentLocation);
  updateScene();
  updateCallouts();
  updateAircraft();

  const airport = airportSelect.options[airportSelect.selectedIndex].textContent;
  const clearance = clearanceSelect.options[clearanceSelect.selectedIndex].textContent;
  const focus = focusSelect.options[focusSelect.selectedIndex].textContent;
  updateStatus(`Scenario active: ${airport}. Clearance: ${clearance}. Focus: ${focus}.`);
  addLogEntry(`Scenario started: ${airport}.`);
  addLogEntry(`Clearance: ${clearance}.`);
};

const startGuidedScenario = (scenarioKey) => {
  const scenario = guidedScenarios[scenarioKey];
  if (!scenario) return;

  scenarioActive = true;
  guidedActive = true;
  currentGuidedScenario = scenario;
  currentStepIndex = 0;
  nextStepBtn.disabled = false;

  aircraftSelect.value = scenario.aircraft;
  airportSelect.value = scenario.airport;
  clearanceSelect.value = scenario.clearance;
  focusSelect.value = scenario.focus;

  score = 0;
  scoreDisplay.textContent = score;
  logEntries.innerHTML = "";
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
    nextStepBtn.disabled = true;
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
  nextStepBtn.disabled = true;
  currentLocation = "Ramp";
  score = 0;
  scoreDisplay.textContent = score;
  updateLocation(currentLocation);
  optionsEl.innerHTML = "";
  signActions.innerHTML = "";
  signPrompt.textContent = "Sign will appear here.";
  signImage.src = "assets/sign-location.svg";
  signImage.alt = "Taxiway sign";
  logEntries.innerHTML = "";
  callouts.innerHTML = "";
  updateStatus("Select a scenario and start to begin taxiing.");
};

startBtn.addEventListener("click", startScenario);
resetBtn.addEventListener("click", resetScenario);
airportSelect.addEventListener("change", updateScene);
focusSelect.addEventListener("change", updateCallouts);
aircraftSelect.addEventListener("change", updateAircraft);
da40ScenarioBtn.addEventListener("click", () => startGuidedScenario("da40Standard"));
da20ScenarioBtn.addEventListener("click", () => startGuidedScenario("da20Progressive"));
nextStepBtn.addEventListener("click", advanceGuidedStep);

updateScene();
updateCallouts();
updateAircraft();
