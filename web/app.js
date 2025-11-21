// Importo libraritë
import express from "express";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 4000;

// Headers bazë për STB
function baseHeaders(mac, portal) {
  return {
    "User-Agent": "MAG250/5.0-0",
    "Referer": portal,
    "X-Device-MAC": mac
  };
}

// Handshake me portalin
async function handshake(mac, portal) {
  const url = `${portal}/portal.php?type=stb&action=handshake&token=&prehash=0&JsHttpRequest=1-xml`;
  const r = await fetch(url, { headers: baseHeaders(mac, portal) });
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

// Merr kanalet
async function fetchChannels(mac, portal) {
  const { cookie } = await handshake(mac, portal);
  const url = `${portal}/portal.php?type=stb&action=get_all_channels&JsHttpRequest=1-xml`;

  const r = await fetch(url, { headers: { ...baseHeaders(mac, portal), Cookie: cookie } });
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
    channels = [];
  }
  return channels;
}

// Gjenero playlistën M3U
function renderM3U(channels, mac, portal) {
  const lines = ["#EXTM3U"];
  for (const ch of channels) {
    const logo = ch.logo ? ` tvg-logo="${ch.logo}"` : "";
    const group = ch.group ? ` group-title="${ch.group}"` : "";
    lines.push(`#EXTINF:-1${logo}${group},${ch.name}`);
    lines.push(`${portal}/play/live.php?mac=${mac}&stream=${ch.id}&extension=ts`);
  }
  return lines.join("\n");
}

// Endpoint API
app.get("/api/portal/m3u", async (req, res) => {
  try {
    const mac = req.query.mac;
    const portal = req.query.portal;

    if (!mac || !portal) {
      return res.status(400).json({ error: "MAC ose portal mungon" });
    }

    const channels = await fetchChannels(mac, portal);
    const m3u = renderM3U(channels, mac, portal);

    res.setHeader("Content-Type", "audio/x-mpegurl; charset=utf-8");
    res.send(m3u);
  } catch (e) {
    console.error("Gabim:", e);
    res.status(500).json({ error: e.message || "Gabim i brendshëm" });
  }
});

// Nis serverin
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
