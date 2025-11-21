export function sanitizeQuery(q) {
  const safe = {};
  for (const [k, v] of Object.entries(q)) {
    if (typeof v !== "string") continue;
    safe[k] = v.replace(/[\r\n]/g, "").trim();
  }
  return safe;
}

export function validateMac(mac) {
  return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(mac);
}