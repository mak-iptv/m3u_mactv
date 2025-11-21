export function parseM3U(text) {
  const lines = text.split(/\r?\n/);
  const channels = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("#EXTINF:")) {
      const info = line.substring(8);
      const attrs = {};
      const attrRegex = /([a-zA-Z0-9-]+)="([^"]*)"/g;
      let m;
      while ((m = attrRegex.exec(info)) !== null) attrs[m[1]] = m[2];
      const name = info.split(",").pop()?.trim() || "Channel";
      current = { name, attrs };
    } else if (line && !line.startsWith("#")) {
      if (current) {
        channels.push({
          name: current.name,
          url: line.trim(),
          logo: current.attrs["tvg-logo"] || null,
          group: current.attrs["group-title"] || "Ungrouped"
        });
        current = null;
      }
    }
  }
  return channels;
}