import fetch from "node-fetch";
import config from "./config.js";

// Headers bazë për STB emulimin
function baseHeaders(mac, portal) {
  return {
    "User-Agent": config.userAgent,
    "Referer": portal,
    "X-Device-MAC": mac
  };
}

// Handshake me portalin
export async function handshake(mac, portal) {
  const url = `${portal}/portal.php?type=stb&action=handshake&token=&prehash=0&JsHttpRequest=1-xml`;
  const r = await fetch(url, { headers: baseHeaders(mac, portal), timeout: config.timeout });
  if (!r.ok) throw new Error(`Handshake failed: ${r.status}`);

  const text = await r.text();
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

// Merr kanalet nga portal
export async function fetchChannels(mac, portal) {
  const { cookie } = await handshake(mac, portal);
  const url = `${portal}/portal.php?type=stb&action=get_all_channels&JsHttpRequest=1-xml`;

  const r = await fetch(url, { headers: { ...baseHeaders(mac, portal), Cookie: cookie }, timeout: config.timeout });
  if (!r.ok) throw new Error(`Channels fetch failed: ${r.status}`);

  const text = await r.text();
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
    // Nëse nuk është JSON, kthe bosh
    channels = [];
  }
  return channels;
}

// Gjenero playlistën M3U
export function renderM3U(channels, mac, portal) {
  const lines = ["#EXTM3U"];
  for (const ch of channels) {
    const logo = ch.logo ? ` tvg-logo="${ch.logo}"` : "";
    const group = ch.group ? ` group-title="${ch.group}"` : "";
    lines.push(`#EXTINF:-1${logo}${group},${ch.name}`);
    lines.push(`${portal}/play/live.php?mac=${mac}&stream=${ch.id}&extension=ts`);
  }
  return lines.join("\n");
}
