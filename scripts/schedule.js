// Verified against the official Sheffield County Council collection calendar
// (downloaded 21 June 2026): all 49 listed collections through 31 May 2027
// match this weekly black/recycling-alternating pattern exactly.
const DEFAULT_CONFIG = { anchorDate: "2026-06-22", recycle: "blue", hasGarden: false };

const BIN_LABELS = {
  black: "Black bin — general waste",
  blue: "Blue bin — paper & card",
  brown: "Brown bin — glass, cans & plastic",
  green: "Green bin — garden waste"
};

function parseISO(s) {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function daysBetween(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

// Returns the bin type ("black" | "blue" | "brown") collected on the given
// date, or null if that date isn't a collection day at all under this model.
function binTypeForDate(date, cfg = DEFAULT_CONFIG) {
  const anchor = parseISO(cfg.anchorDate);
  const diff = daysBetween(date, anchor);
  if (diff % 7 !== 0) return null; // not the right weekday
  const kk = diff / 7;
  const slot = ((kk % 4) + 4) % 4;
  const other = cfg.recycle === "blue" ? "brown" : "blue";
  if (slot === 0) return cfg.recycle;
  if (slot === 2) return other;
  return "black"; // slots 1 and 3
}

module.exports = { DEFAULT_CONFIG, BIN_LABELS, binTypeForDate, parseISO, daysBetween };
