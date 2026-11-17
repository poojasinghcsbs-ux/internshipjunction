function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function placeholderSvg({ seed = "internshipjunction", label = "InternshipJunction", hue } = {}) {
  const baseHue = hue ?? hashString(seed) % 360;
  const hue2 = (baseHue + 42) % 360;
  const safeLabel = String(label).replace(/[<>&]/g, "").slice(0, 42);
  const lines = safeLabel.split(" ");
  const first = lines.slice(0, Math.ceil(lines.length / 2)).join(" ");
  const second = lines.slice(Math.ceil(lines.length / 2)).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="${safeLabel}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${baseHue} 82% 52%)"/>
      <stop offset="100%" stop-color="hsl(${hue2} 78% 42%)"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <circle cx="540" cy="70" r="120" fill="hsla(0 0% 100% / 0.12)"/>
  <circle cx="90" cy="320" r="90" fill="hsla(0 0% 100% / 0.10)"/>
  <text x="40" y="196" font-family="Inter, Segoe UI, sans-serif" font-size="44" font-weight="800" fill="white">${first}</text>
  <text x="40" y="246" font-family="Inter, Segoe UI, sans-serif" font-size="44" font-weight="800" fill="white" opacity="0.9">${second}</text>
</svg>`;
}

export function thumb(seed, label) {
  return `/api/placeholder?seed=${encodeURIComponent(seed)}&label=${encodeURIComponent(label)}`;
}
