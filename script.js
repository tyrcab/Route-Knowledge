const lineSelect = document.getElementById("lineSelect");
const stationSelect = document.getElementById("stationSelect");
const showTerminating = document.getElementById("showTerminating");
const showStabling = document.getElementById("showStabling");
const output = document.getElementById("output");

// Automatically load lines from /data/manifest.json
async function loadLines() {
  try {
    const manifest = await fetch("data/manifest.json").then(res => res.json());
    lineSelect.innerHTML = "<option value=''>-- Select Line --</option>";
    manifest.files.forEach(file => {
      const lineName = file.replace(".json", "");
      const opt = document.createElement("option");
      opt.value = lineName;
      opt.textContent = capitalize(lineName);
      lineSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Error loading line list:", err);
    lineSelect.innerHTML = "<option>Error loading lines</option>";
  }
}

loadLines();

// When line is selected
lineSelect.addEventListener("change", async (e) => {
  const selectedLine = e.target.value;
  if (!selectedLine) {
    stationSelect.disabled = true;
    stationSelect.innerHTML = "<option>-- Select Station --</option>";
    output.innerHTML = "";
    return;
  }

  try {
    const data = await fetch(`data/${selectedLine}.json`).then(res => res.json());
    stationSelect.disabled = false;
    stationSelect.innerHTML = "<option>-- Select Station --</option>";

    data.stations.forEach(st => {
      const opt = document.createElement("option");
      opt.value = st.name;
      opt.textContent = st.name;
      stationSelect.appendChild(opt);
    });

    stationSelect.dataset.lineData = JSON.stringify(data);
    output.innerHTML = `<p>Select a station from the ${capitalize(selectedLine)} line.</p>`;
  } catch (err) {
    output.innerHTML = `<p style="color:red;">Failed to load data for ${capitalize(selectedLine)} line.</p>`;
    console.error(err);
  }
});

stationSelect.addEventListener("change", (e) => {
  const data = JSON.parse(stationSelect.dataset.lineData);
  const stationName = e.target.value;
  const station = data.stations.find(st => st.name === stationName);
  displayInfo(station, data);
});

showTerminating.addEventListener("change", refreshDisplay);
showStabling.addEventListener("change", refreshDisplay);

function refreshDisplay() {
  const selectedStation = stationSelect.value;
  if (!selectedStation) return;
  const data = JSON.parse(stationSelect.dataset.lineData);
  const station = data.stations.find(st => st.name === selectedStation);
  displayInfo(station, data);
}

function displayInfo(station, lineData) {
  let html = `<h3>${station.name}</h3>`;

  // ✅ Add operational information (from DOCX)
  html += `<table class="info-table">
    <tr><td><strong>Signaller:</strong></td><td>${station.signaller || "—"}</td></tr>
    <tr><td><strong>Recorded:</strong></td><td>${station.recorded || "—"}</td></tr>
    <tr><td><strong>Caution Orders:</strong></td><td>${station.caution_orders || "—"}</td></tr>
    <tr><td><strong>Driver Points:</strong></td><td>${station.driver_points || "—"}</td></tr>
  </table>`;

  if (station.description) {
    html += `<p class="desc">${station.description}</p>`;
  }

  // ✅ Show Terminating Locations
  if (showTerminating.checked && lineData.terminating?.length) {
    html += `<h4>Terminating Locations</h4><ul>`;
    lineData.terminating.forEach(t => html += `<li>${t}</li>`);
    html += `</ul>`;
  }

  // ✅ Show Stabling Locations
  if (showStabling.checked && lineData.stabling?.length) {
    html += `<h4>Stabling Locations</h4><ul>`;
    lineData.stabling.forEach(s => html += `<li>${s}</li>`);
    html += `</ul>`;
  }

  output.innerHTML = html;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

