import { parseM3U } from "./m3u-parser.js";
import { player } from "./player.js";

const video = document.getElementById("player");
const channelListEl = document.getElementById("channelList");
const playBtn = document.getElementById("playBtn");
const portalUrlEl = document.getElementById("portalUrl");
const macEl = document.getElementById("mac");

function playUrl(url) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
  } else {
    video.src = url;
    video.play().catch(() => alert("Ky shfletues nuk mbështet HLS."));
  }
}

function renderChannels(channels) {
  channelListEl.innerHTML = "";
  for (const ch of channels) {
    const li = document.createElement("li");
    if (ch.logo) {
      const logo = document.createElement("img");
      logo.src = ch.logo;
      logo.style.width = "24px";
      logo.style.height = "24px";
      li.appendChild(logo);
    }
    const name = document.createElement("span");
    name.textContent = `${ch.name} [${ch.group}]`;
    const play = document.createElement("button");
    play.textContent = "Play";
    play.onclick = () => playUrl(ch.url);
    li.append(name, play);
    channelListEl.appendChild(li);
  }
}

playBtn.onclick = async () => {
  const portalUrl = portalUrlEl.value.trim();
  const mac = macEl.value.trim();
  const r = await fetch(`/api/portal/m3u?mac=${encodeURIComponent(mac)}&portal=${encodeURIComponent(portalUrl)}`);
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    alert("Gabim: " + (j.error || r.status));
    return;
  }
  const text = await r.text();
  const channels = parseM3U(text);
  renderChannels(channels);
};