const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("status");
const locationDisplay = document.getElementById("locationDisplay");
const optionsEl = document.getElementById("options");
const signPrompt = document.getElementById("signPrompt");
const signActions = document.getElementById("signActions");

const airportSelect = document.getElementById("airportSelect");
const clearanceSelect = document.getElementById("clearanceSelect");
const focusSelect = document.getElementById("focusSelect");

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

const signOptions = [
  { label: "Location sign", value: "location" },
  { label: "Directional sign", value: "directional" },
  { label: "Runway hold short sign", value: "runway" },
];

let currentLocation = "Ramp";
let scenarioActive = false;

const updateStatus = (message) => {
  statusEl.textContent = message;
};

const updateLocation = (location) => {
  locationDisplay.textContent = location;
};

const renderOptions = (location) => {
  optionsEl.innerHTML = "";
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
    return;
  }

  signPrompt.textContent = node.sign.text;
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
  } else {
    updateStatus("Incorrect sign ID. Stop the aircraft and re-evaluate signage before proceeding.");
  }
};

const handleMove = (option) => {
  if (!scenarioActive) return;

  if (option.next.startsWith("Runway") && !updateRunwayClearance(option.next)) {
    updateStatus("Hold short! You attempted to enter a runway without clearance.");
    return;
  }

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
  return true;
};

const startScenario = () => {
  scenarioActive = true;
  currentLocation = "Ramp";
  updateLocation(currentLocation);
  renderOptions(currentLocation);
  renderSignPrompt(currentLocation);

  const airport = airportSelect.options[airportSelect.selectedIndex].textContent;
  const clearance = clearanceSelect.options[clearanceSelect.selectedIndex].textContent;
  const focus = focusSelect.options[focusSelect.selectedIndex].textContent;
  updateStatus(`Scenario active: ${airport}. Clearance: ${clearance}. Focus: ${focus}.`);
};

const resetScenario = () => {
  scenarioActive = false;
  currentLocation = "Ramp";
  updateLocation(currentLocation);
  optionsEl.innerHTML = "";
  signActions.innerHTML = "";
  signPrompt.textContent = "Sign will appear here.";
  updateStatus("Select a scenario and start to begin taxiing.");
};

startBtn.addEventListener("click", startScenario);
resetBtn.addEventListener("click", resetScenario);
