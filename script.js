const lineSelect = document.getElementById("lineSelect");
const stationSelect = document.getElementById("stationSelect");
const showTerminating = document.getElementById("showTerminating");
const showStabling = document.getElementById("showStabling");
const output = document.getElementById("output");

// Define available lines
const lines = [
  "Cranbourne",
  "Frankston",
  "Sandringham"
  // ... add up to 10 lines here
];

// Populate line dropdown
lines.forEach(line => {
  const opt = document.createElement("option");
  opt.value = line.toLowerCase();
  opt.textContent = line;
  lineSelect.appendChild(opt);
});

// Handle line selection
lineSelect.addEventListener("change", async (e) => {
  const selectedLine = e.target.value;
  if (!selectedLine) {
    stationSelect.disabled = true;
    stationSelect.innerHTML = "<option>-- Select Station --</option>";
    output.innerHTML = "";
    return;
  }

  const data = await fetch(`data/${selectedLine}.json`).then(res => res.json());
  
  stationSelect.disabled = false;
  stationSelect.innerHTML = "<option>-- Select Station --</option>";
  
  data.stations.forEach(st => {
    const opt = document.createElement("option");
    opt.value = st.name;
    opt.textContent = st.name;
    stationSelect.appendChild(opt);
  });

  // Save for later use
  stationSelect.dataset.lineData = JSON.stringify(data);
});

// Handle station selection
stationSelect.addEventListener("change", (e) => {
  const lineData = JSON.parse(stationSelect.dataset.lineData);
  const selectedStation = e.target.value;
  const stationInfo = lineData.stations.find(st => st.name === selectedStation);
  
  displayInfo(stationInfo, lineData);
});

// Handle toggles
showTerminating.addEventListener("change", () => refreshDisplay());
showStabling.addEventListener("change", () => refreshDisplay());

function refreshDisplay() {
  const selectedStation = stationSelect.value;
  if (!selectedStation) return;
  const lineData = JSON.parse(stationSelect.dataset.lineData);
  const stationInfo = lineData.stations.find(st => st.name === selectedStation);
  displayInfo(stationInfo, lineData);
}

function displayInfo(station, lineData) {
  let html = `<h3>${station.name}</h3>`;
  html += `<p>${station.description || "No details available."}</p>`;

  if (showTerminating.checked) {
    html += `<h4>Terminating Locations:</h4><ul>`;
    lineData.terminating.forEach(t => html += `<li>${t}</li>`);
    html += `</ul>`;
  }

  if (showStabling.checked) {
    html += `<h4>Stabling Locations:</h4><ul>`;
    lineData.stabling.forEach(s => html += `<li>${s}</li>`);
    html += `</ul>`;
  }

  output.innerHTML = html;
}
