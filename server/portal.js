import fetch from "node-fetch";

// Ndërtimi i URL-ve të plota
function full(base, path) {
  return `${base}${path.startsWith("/") ? path : "/" + path}`;
}

// Headers bazë për STB
function baseHeaders(mac, portal) {
  return {
    "User-Agent": "MAG250/5.0-0",
    "Referer": portal,
    "X-Device-MAC": mac
  };
}

// Handshake
export async function handshake(mac, portal) {
  const url = full(portal, "portal.php?type=stb&action=handshake&token=&prehash=0&JsHttpRequest=1-xml");
  const r = await fetch(url, { headers: baseHeaders(mac, portal) });
  if (!r.ok) throw new Error(`Handshake failed: ${r.status}`);

  const text = await r.text(); // Lexo body vetëm një herë
  console.log("Handshake raw:", text);

  const setCookie = r.headers.get("set-cookie") || "";
  const cookie = setCookie.split(",")[0]?.split(";")[0] || "";

  let token = "";
  try {
    const data = JSON.parse(text);
    token = data?.js?.token || data?.token || "";
  } catch {
    const m = text.match(/"token"\s*:\s*"([^"]+)"/);
    token = m?.[1] || "";
  }
  return { cookie, token };
}

// Merr kanalet
export async function fetchChannels(mac, portal) {
  const { cookie } = await handshake(mac, portal);
  const url = full(portal, "portal.php?type=stb&action=get_all_channels&JsHttpRequest=1-xml");

  const r = await fetch(url, { headers: { ...baseHeaders(mac, portal), Cookie: cookie } });
  if (!r.ok) throw new Error(`Channels fetch failed: ${r.status}`);

  const text = await r.text(); // Lexo body vetëm një herë
  console.log("Channels raw:", text);

  let channels = [];
  try {
    const data = JSON.parse(text);
    channels = (data?.js?.channels || data?.channels || []).map(ch => ({
      id: ch.id || ch.stream_id,
      name: ch.name || ch.title,
      group: ch.category || "Ungrouped",
      logo: ch.logo || ""
    }));
  } catch {
    channels = [];
  }
  return channels;
}

// Gjenero M3U
export function renderM3U(channels, mac, portal) {
  const lines = ["#EXTM3U"];
  for (const ch of channels) {
    const logo = ch.logo ? ` tvg-logo="${ch.logo}"` : "";
    const group = ch.group ? ` group-title="${ch.group}"` : "";
    lines.push(`#EXTINF:-1${logo}${group},${ch.name}`);
    lines.push(full(portal, `play/live.php?mac=${mac}&stream=${ch.id}&extension=ts`));
  }
  return lines.join("\n");
}