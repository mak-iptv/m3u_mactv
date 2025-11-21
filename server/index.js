import express from "express";
import { fetchChannels, renderM3U } from "./portal.js";

const app = express();

// Endpoint për gjenerimin e playlistës M3U
app.get("/api/portal/m3u", async (req, res) => {
  try {
    const mac = req.query.mac;
    const portal = req.query.portal;

    // Validim bazë
    if (!mac || !portal) {
      return res.status(400).json({ error: "MAC ose portal mungon" });
    }

    // Kontrollo që portal është URL valide
    try {
      new URL(portal);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Merr kanalet nga portal
    const channels = await fetchChannels(mac, portal);

    // Gjenero playlistën M3U
    const m3u = renderM3U(channels, mac, portal);

    res.setHeader("Content-Type", "audio/x-mpegurl; charset=utf-8");
    res.send(m3u);
  } catch (e) {
    console.error("Gabim:", e);
    res.status(500).json({ error: e.message || "Gabim i brendshëm" });
  }
});

// Nis serverin
app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});