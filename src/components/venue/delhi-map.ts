/*
 * Geometry for the schematic route map of South and Central Delhi (VenueMap).
 * Everything is real latitude/longitude, projected once onto a 1000-wide
 * canvas, so landmarks, metro lines and routes stay where they are on the
 * ground. It is a sketch, not a street map: lines are smoothed and simplified.
 */

type LatLng = readonly [lat: number, lng: number];
export type Pt = readonly [x: number, y: number];

const NORTH = 28.652;
const SOUTH = 28.505;
const WEST = 77.07;
const EAST = 77.28;
const COS = Math.cos((((NORTH + SOUTH) / 2) * Math.PI) / 180);

export const MAP_W = 1000;
const KX = MAP_W / (EAST - WEST);
const KY = KX / COS;
export const MAP_H = Math.round((NORTH - SOUTH) * KY);

const r1 = (v: number) => Math.round(v * 10) / 10;
export const project = ([lat, lng]: LatLng): Pt => [r1((lng - WEST) * KX), r1((NORTH - lat) * KY)];

/** Smooth path through the points (Catmull-Rom as cubic Béziers). */
function smooth(points: readonly LatLng[], closed = false): string {
  const p = points.map(project);
  const n = p.length;
  if (n < 2) return "";
  const at = (i: number) => (closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [a, b, c, e] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [r1(b[0] + (c[0] - a[0]) / 6), r1(b[1] + (c[1] - a[1]) / 6)];
    const c2 = [r1(c[0] - (e[0] - b[0]) / 6), r1(c[1] - (e[1] - b[1]) / 6)];
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${c[0]} ${c[1]}`;
  }
  return closed ? `${d} Z` : d;
}

// --- Places -----------------------------------------------------------------

const P = {
  iitd: [28.5455, 77.1926],
  t3: [28.5562, 77.087],
  t1: [28.5605, 77.119],
  ndls: [28.643, 77.2194],
  nizamuddin: [28.588, 77.2536],
  hauzKhasMetro: [28.5434, 77.2066],
  iitMetro: [28.5488, 77.1958],
  rajivChowk: [28.6328, 77.2197],
  indiaGate: [28.6129, 77.2295],
  qutub: [28.5245, 77.1855],
  aerocity: [28.5487, 77.1208],
  dhaulaKuan: [28.5918, 77.1617],
} as const satisfies Record<string, LatLng>;

export type PlaceKind = "venue" | "air" | "rail" | "metro" | "road" | "sight";
export interface Place {
  id: string;
  label: string;
  kind: PlaceKind;
  at: Pt;
  /** Which side of the pin the label sits on. */
  side?: "left" | "right" | "top" | "top-start" | "bottom";
}

export const VENUE: Place = { id: "iitd", label: "IIT Delhi", kind: "venue", at: project(P.iitd), side: "left" };

export const PLACES: Place[] = [
  { id: "t3", label: "IGI Airport T3", kind: "air", at: project(P.t3), side: "top-start" },
  { id: "t1", label: "Terminal 1", kind: "air", at: project(P.t1), side: "top" },
  { id: "ndls", label: "New Delhi station", kind: "rail", at: project(P.ndls), side: "left" },
  { id: "nizamuddin", label: "Hazrat Nizamuddin", kind: "rail", at: project(P.nizamuddin), side: "left" },
  { id: "rajivChowk", label: "Rajiv Chowk", kind: "metro", at: project(P.rajivChowk), side: "right" },
  { id: "hauzKhasMetro", label: "Hauz Khas metro", kind: "metro", at: project(P.hauzKhasMetro), side: "right" },
  { id: "indiaGate", label: "India Gate", kind: "road", at: project(P.indiaGate), side: "right" },
  { id: "qutub", label: "Qutub Minar", kind: "sight", at: project(P.qutub), side: "left" },
];

// --- Base map ---------------------------------------------------------------

const GREEN_SHAPES: LatLng[][] = [
  // Central Ridge
  [[28.646, 77.172], [28.641, 77.194], [28.622, 77.19], [28.611, 77.171], [28.626, 77.158]],
  // Delhi Cantonment
  [[28.601, 77.122], [28.599, 77.151], [28.58, 77.153], [28.574, 77.131]],
  // Sanjay Van and the JNU forest
  [[28.549, 77.153], [28.541, 77.18], [28.523, 77.181], [28.514, 77.161], [28.53, 77.147]],
  // Deer Park
  [[28.5605, 77.1915], [28.5585, 77.2015], [28.5495, 77.2005], [28.5515, 77.1905]],
  // Lodhi Garden
  [[28.5965, 77.2145], [28.595, 77.2245], [28.589, 77.224], [28.5895, 77.2135]],
  // Nehru Park
  [[28.5985, 77.1835], [28.5965, 77.1955], [28.588, 77.194], [28.589, 77.184]],
];
export const GREEN = GREEN_SHAPES.map((shape) => smooth(shape, true));

export const AIRPORT = smooth([[28.586, 77.074], [28.581, 77.118], [28.555, 77.129], [28.543, 77.091], [28.556, 77.072]], true);
export const RUNWAYS = [
  smooth([[28.578, 77.082], [28.562, 77.116]]),
  smooth([[28.571, 77.079], [28.553, 77.108]]),
];

export const CAMPUS = smooth([[28.5502, 77.1862], [28.5495, 77.1985], [28.5418, 77.1992], [28.5408, 77.1878]], true);

export const RIVER = smooth([[28.665, 77.243], [28.641, 77.252], [28.622, 77.262], [28.601, 77.268], [28.585, 77.276], [28.57, 77.292]]);

export const ROADS: { id: string; d: string; major?: boolean }[] = [
  { id: "ring", d: smooth([[28.665, 77.135], [28.63, 77.142], [28.5918, 77.1617], [28.572, 77.183], [28.567, 77.209], [28.566, 77.236], [28.573, 77.252], [28.592, 77.257], [28.628, 77.251], [28.665, 77.246]]), major: true },
  { id: "outer-ring", d: smooth([[28.5918, 77.1617], [28.566, 77.166], [28.557, 77.174], [28.5492, 77.1935], [28.538, 77.224], [28.548, 77.252], [28.546, 77.29]]), major: true },
  { id: "nh48", d: smooth([[28.49, 77.072], [28.522, 77.104], [28.546, 77.126], [28.57, 77.143], [28.5918, 77.1617]]), major: true },
  { id: "aurobindo", d: smooth([[28.5895, 77.2105], [28.568, 77.2085], [28.553, 77.2045], [28.5455, 77.2005], [28.532, 77.1975], [28.515, 77.19], [28.495, 77.183]]) },
  { id: "janpath", d: smooth([[28.6328, 77.2197], [28.6129, 77.2195], [28.5895, 77.2105]]) },
  { id: "rajpath", d: smooth([[28.6145, 77.199], [28.6129, 77.2295]]) },
  { id: "mandela", d: smooth([[28.546, 77.126], [28.538, 77.152], [28.551, 77.168], [28.557, 77.174]]) },
];

export type LineId = "yellow" | "magenta" | "express";

export const METRO: { id: LineId; name: string; color: string; d: string; stations: Pt[] }[] = [
  {
    id: "yellow",
    name: "Yellow Line",
    color: "#e8b100",
    d: smooth([[28.665, 77.229], [28.6497, 77.2263], [28.643, 77.2215], [28.6328, 77.2197], [28.6226, 77.2141], [28.615, 77.2119], [28.5973, 77.2105], [28.5875, 77.212], [28.5752, 77.2093], [28.5687, 77.2081], [28.5596, 77.2066], [28.5434, 77.2066], [28.5281, 77.2056], [28.5206, 77.2014], [28.5127, 77.1863], [28.495, 77.172]]),
    stations: ([[28.643, 77.2215], [28.6328, 77.2197], [28.615, 77.2119], [28.5875, 77.212], [28.5687, 77.2081], [28.5596, 77.2066], [28.5434, 77.2066], [28.5281, 77.2056], [28.5206, 77.2014], [28.5127, 77.1863]] as LatLng[]).map(project),
  },
  {
    id: "magenta",
    name: "Magenta Line",
    color: "#c2307a",
    d: smooth([[28.665, 77.083], [28.615, 77.085], [28.588, 77.086], [28.578, 77.11], [28.5605, 77.119], [28.5585, 77.142], [28.5576, 77.1621], [28.5578, 77.1741], [28.5555, 77.1845], [28.5488, 77.1958], [28.5434, 77.2066], [28.5421, 77.2196], [28.5376, 77.2309], [28.5446, 77.2496], [28.5502, 77.2589], [28.558, 77.277], [28.562, 77.295]]),
    stations: ([[28.5605, 77.119], [28.5576, 77.1621], [28.5578, 77.1741], [28.5488, 77.1958], [28.5434, 77.2066], [28.5421, 77.2196], [28.5376, 77.2309], [28.5502, 77.2589]] as LatLng[]).map(project),
  },
  {
    id: "express",
    name: "Airport Express",
    color: "#ef7d1a",
    d: smooth([[28.643, 77.2215], [28.629, 77.2117], [28.612, 77.188], [28.5918, 77.1617], [28.5487, 77.1208], [28.5562, 77.087], [28.5523, 77.058]]),
    stations: ([[28.643, 77.2215], [28.629, 77.2117], [28.5918, 77.1617], [28.5487, 77.1208], [28.5562, 77.087]] as LatLng[]).map(project),
  },
];

export const AREA_LABELS: { label: string; at: Pt; rotate?: number }[] = [
  { label: "Delhi Cantt", at: project([28.588, 77.128]) },
  { label: "Vasant Kunj", at: project([28.523, 77.152]) },
  { label: "Aerocity", at: project([28.541, 77.122]) },
  { label: "Saket", at: project([28.517, 77.214]) },
  { label: "Yamuna", at: project([28.614, 77.27]), rotate: -62 },
];

// --- Routes -----------------------------------------------------------------

export type Mode = "air" | "rail" | "metro" | "road";

export interface Route {
  /** Where the trip starts (a Place id). */
  from: string;
  d: string;
  /** Metro lines that matter for this way of arriving. */
  lines: LineId[];
  /** Pre-filled origin and travel mode for the Google Maps directions link. */
  origin?: string;
  travel: "driving" | "transit";
}

export const ROUTES: Record<Mode, Route[]> = {
  air: [
    {
      from: "t3",
      d: smooth([P.t3, [28.5488, 77.1085], [28.546, 77.126], [28.539, 77.15], [28.551, 77.168], [28.557, 77.174], [28.5492, 77.1925], P.iitd]),
      lines: ["express", "magenta"],
      origin: "Indira Gandhi International Airport Terminal 3, New Delhi",
      travel: "driving",
    },
  ],
  rail: [
    {
      from: "ndls",
      d: smooth([P.ndls, [28.6328, 77.2197], [28.615, 77.2119], [28.5875, 77.212], [28.5687, 77.2081], [28.5596, 77.2066], P.hauzKhasMetro, [28.5455, 77.2005], P.iitd]),
      lines: ["yellow"],
      origin: "New Delhi Railway Station",
      travel: "transit",
    },
    {
      from: "nizamuddin",
      d: smooth([P.nizamuddin, [28.578, 77.2535], [28.567, 77.242], [28.566, 77.222], [28.567, 77.209], [28.553, 77.2045], [28.5455, 77.2005], P.iitd]),
      lines: [],
      origin: "Hazrat Nizamuddin Railway Station",
      travel: "driving",
    },
  ],
  metro: [
    {
      from: "rajivChowk",
      d: smooth([P.rajivChowk, [28.6226, 77.2141], [28.615, 77.2119], [28.5973, 77.2105], [28.5875, 77.212], [28.5752, 77.2093], [28.5687, 77.2081], [28.5596, 77.2066], P.hauzKhasMetro, [28.5455, 77.2005], P.iitd]),
      lines: ["yellow", "magenta"],
      travel: "transit",
    },
  ],
  road: [
    {
      from: "indiaGate",
      d: smooth([P.indiaGate, [28.6129, 77.2195], [28.6, 77.2145], [28.5895, 77.2105], [28.568, 77.2085], [28.553, 77.2045], [28.5455, 77.2005], P.iitd]),
      lines: [],
      travel: "driving",
    },
  ],
};

export const MODE_ORIGIN_KIND: Record<Mode, PlaceKind> = { air: "air", rail: "rail", metro: "metro", road: "road" };
