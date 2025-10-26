const lineSelect = document.getElementById("lineSelect");
const stationSelect = document.getElementById("stationSelect");
const showTerminating = document.getElementById("showTerminating");
const showStabling = document.getElementById("showStabling");
const output = document.getElementById("output");

// 🔹 Load available lines from /data/manifest.json
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

// 🔹 When line is selected
lineSelect.addEventListener("change", async (e) => {
  const selectedLine = e.target.value;

  // Clear everything when changing lines
  stationSelect.innerHTML = "<option value=''>-- Select Station --</option>";
  stationSelect.disabled = true;
  output.innerHTML = "";
  delete stationSelect.dataset.lineData;

  // Reset toggles
  showTerminating.checked = false;
  showStabling.checked = false;

  if (!selectedLine) return;

  try {
    output.innerHTML = `<p style="color:#1E90FF;">Loading ${capitalize(selectedLine)} line...</p>`;
    const data = await fetch(`data/${selectedLine}.json`).then(res => res.json());

    // Populate stations for selected line
    data.stations.forEach(st => {
      const opt = document.createElement("option");
      opt.value = st.name;
      opt.textContent = st.name;
      stationSelect.appendChild(opt);
    });

    stationSelect.disabled = false;
    stationSelect.dataset.lineData = JSON.stringify(data);

    // Show message and refresh if toggles are on
    output.innerHTML = `<p>Select a station or use toggles to view ${capitalize(selectedLine)} line info.</p>`;
    refreshDisplay();

  } catch (err) {
    console.error("Error loading line:", err);
    output.innerHTML = `<p style="color:red;">Failed to load data for ${selectedLine} line.</p>`;
  }
});

// 🔹 When a station is selected
stationSelect.addEventListener("change", (e) => {
  const data = JSON.parse(stationSelect.dataset.lineData);
  const stationName = e.target.value;
  const station = data.stations.find(st => st.name === stationName);
  displayInfo(station, data);
});

// 🔹 Toggles
showTerminating.addEventListener("change", refreshDisplay);
showStabling.addEventListener("change", refreshDisplay);

// 🔹 Refresh display (used for toggles and initial line load)
function refreshDisplay() {
  const lineData = stationSelect.dataset.lineData
    ? JSON.parse(stationSelect.dataset.lineData)
    : null;

  const selectedStation = stationSelect.value
    ? lineData.stations.find(st => st.name === stationSelect.value)
    : null;

  if (lineData) {
    displayInfo(selectedStation, lineData);
  } else {
    output.classList.remove("visible");
    output.innerHTML = "";
  }
}

// 🔹 Display station info + terminating/stabling lists
function displayInfo(station, lineData) {
  const hasStation = !!station;
  const showTerm = showTerminating.checked && lineData?.terminating?.length;
  const showStable = showStabling.checked && lineData?.stabling?.length;

  // Hide output if no station and no toggles
  if (!hasStation && !showTerm && !showStable) {
    output.classList.remove("visible");
    output.innerHTML = "";
    return;
  }

  let html = "";

  // ✅ Station info section
  if (station) {
    const isTerminating = lineData.terminating.some(
      loc => loc.toLowerCase().includes(station.name.toLowerCase())
    );
    const isStabling = lineData.stabling.some(
      loc => loc.toLowerCase().includes(station.name.toLowerCase())
    );

    const tick = '<span class="tick">✅</span>';
    const cross = '<span class="cross">❌</span>';

    html += `<h3>${station.name}</h3>`;
    html += `<table class="info-table">
      <tr><td><strong>Signaller:</strong></td><td>${station.signaller || "—"}</td></tr>
      <tr><td><strong>Recorded:</strong></td><td>${station.recorded || "—"}</td></tr>
      <tr><td><strong>Caution Orders:</strong></td><td>${station.caution_orders || "—"}</td></tr>
      <tr><td><strong>Driver Points:</strong></td><td>${station.driver_points || "—"}</td></tr>
      <tr><td><strong>Terminating Location:</strong></td><td>${isTerminating ? tick : cross}</td></tr>
      <tr><td><strong>Stabling Location:</strong></td><td>${isStabling ? tick : cross}</td></tr>
    </table>`;

    if (station.description) {
      html += `<p class="desc">${station.description}</p>`;
    }
  }

  // ✅ Always show terminating/stabling lists when toggled
  if (showTerm) {
    html += `<h4>Terminating Locations</h4><ul>`;
    lineData.terminating.forEach(t => html += `<li>${t}</li>`);
    html += `</ul>`;
  }

  if (showStable) {
    html += `<h4>Stabling Locations</h4><ul>`;
    lineData.stabling.forEach(s => html += `<li>${s}</li>`);
    html += `</ul>`;
  }

  // Show or hide output
  if (html.trim() !== "") {
    output.innerHTML = html;
    output.classList.add("visible");
  } else {
    output.innerHTML = "";
    output.classList.remove("visible");
  }
}

// 🔹 Helper function
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🔹 Terms of Service Modal Logic
const tosLink = document.getElementById("tosLink");
const tosModal = document.getElementById("tosModal");
const closeBtn = tosModal.querySelector(".close");
const closeFooterBtn = tosModal.querySelector(".close-btn");

// Open modal when link is clicked
tosLink.addEventListener("click", (e) => {
  e.preventDefault();
  tosModal.classList.add("show");
});

// Close modal buttons
closeBtn.addEventListener("click", () => tosModal.classList.remove("show"));
closeFooterBtn.addEventListener("click", () => tosModal.classList.remove("show"));

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === tosModal) tosModal.classList.remove("show");
});

// 🔹 Auto-update version info from version.json
async function updateVersionInfo() {
  const versionElement = document.getElementById("appVersion");
  if (!versionElement) return;

  try {
    const res = await fetch("./version.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`version.json fetch failed: ${res.status}`);
    const data = await res.json();
    versionElement.textContent = `Version: ${data.version} (Updated ${data.updated})`;
  } catch (err) {
    console.error("Failed to load version info:", err);
    versionElement.textContent = "Version: v1.0.0 (Offline)";
  }
}

document.addEventListener("DOMContentLoaded", updateVersionInfo);

// 🔹 Register Service Worker & handle updates (same as Serviceability app)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("./sw.js");
      console.log("✅ Service Worker registered");

      const showToast = (msg) => {
        const toast = document.getElementById("updateToast");
        if (!toast) return;
        toast.textContent = msg;
        toast.style.display = "block";
      };

      // --- Check if waiting worker is ready ---
      if (reg.waiting) {
        showToast("🔄 A new version is available — updating...");
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      // --- Detect new SW installation ---
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            showToast("🔄 A new version is available — updating...");
            setTimeout(() => {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }, 1500);
          }
        });
      });

      // --- Handle SW messages ---
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "NEW_VERSION") {
          console.log("🆕 New version detected, reloading...");
          setTimeout(() => {
            caches.keys()
              .then(keys => Promise.all(keys.map(k => caches.delete(k))))
              .finally(() => location.reload(true));
          }, 1500);
        }
      });

      // --- Periodic version checks every 5 minutes ---
      setInterval(() => {
        if (reg.active) reg.active.postMessage("checkForUpdate");
      }, 300000);
    } catch (err) {
      console.error("Service Worker registration failed:", err);
    }
  });
}
