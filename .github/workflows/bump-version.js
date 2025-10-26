import fs from "fs";

function bumpVersion(file) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const current = data.version?.replace(/^v/i, "") || "1.0.0";
  const parts = current.split(".").map(Number);

  // bump patch: vX.Y.(Z+1)
  parts[2] = (parts[2] || 0) + 1;
  const newVersion = `v${parts.join(".")}`;

  data.version = newVersion;
  data.updated = new Date().toISOString();

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`✅ Updated ${file} → ${newVersion}`);
  return newVersion;
}

try {
  // 1) bump manifest.json
  const manifestVersion = bumpVersion("manifest.json");

  // 2) also write version.json used by the UI
  const versionFile = {
    version: manifestVersion,
    updated: new Date().toLocaleString("en-AU")
  };
  fs.writeFileSync("version.json", JSON.stringify(versionFile, null, 2));
  console.log("✅ version.json also updated.");
} catch (err) {
  console.error("❌ Version bump failed:", err);
  process.exit(1);
}
