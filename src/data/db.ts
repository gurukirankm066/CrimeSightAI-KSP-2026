// Deterministic seeded RNG so all synthetic data is stable across renders/pages.
let _seed = 0x9e3779b9;
function rng(): number {
  _seed ^= _seed << 13;
  _seed ^= _seed >>> 17;
  _seed ^= _seed << 5;
  return ((_seed >>> 0) % 100000) / 100000;
}
function reseed(s: number) {
  _seed = s >>> 0 || 1;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function int(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export type Severity = "critical" | "high" | "medium" | "low";
export type CaseStatus = "open" | "investigating" | "pending" | "closed";

export interface District {
  id: string;
  name: string;
  lat: number;
  lng: number;
  population: number;
  crimeIndex: number; // 0-100 heat
  activeCases: number;
  trend: number; // pct change overnight
}

export interface PoliceStation {
  id: string;
  name: string;
  districtId: string;
  district: string;
  lat: number;
  lng: number;
  crimeIndex: number;
  activeCases: number;
  trend: number;
  officerInCharge: string;
}

export interface Officer {
  id: string;
  name: string;
  rank: string;
  district: string;
  badge: string;
  station: string;
  caseload: number;
  avatarHue: number;
}

export interface FIR {
  id: string;
  number: string;
  type: string;
  district: string;
  station: string;
  date: string;
  status: CaseStatus;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  flag: string;
}

export interface Suspect {
  id: string;
  name: string;
  alias: string;
  age: number;
  district: string;
  riskScore: number;
  priors: number;
  status: "wanted" | "monitored" | "detained" | "released";
}

export interface CaseRecord {
  id: string;
  fir: string;
  title: string;
  type: string;
  district: string;
  station: string;
  priority: Severity;
  status: CaseStatus;
  officerId: string;
  opened: string;
  updated: string;
  victims: { name: string; age: number; gender: string }[];
  accused: { name: string; status: string }[];
  evidence: { id: string; type: string; label: string; collected: string; chain: string }[];
  timeline: { time: string; label: string; actor: string }[];
  related: string[];
  summary: string;
}

export interface Alert {
  id: string;
  severity: Severity;
  title: string;
  district: string;
  timestamp: string;
  source: string;
  action: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  evidence: string[];
  action: string;
  /** short plain-language justification for the suggested action */
  why: string;
  /** operational risk factors amplifying the situation */
  riskFactors: string[];
  /** step-by-step reasoning chain (3-5 bullets) */
  reasoning: string[];
  /** expected outcome if the recommendation is followed */
  predictedImpact: string;
}

export interface GraphNode {
  id: string;
  label: string;
  kind: "person" | "vehicle" | "location" | "fir";
  risk: number;
  pinned?: boolean;
  firstSeen: number; // 0-100 timeline position
}
export interface GraphLink {
  source: string;
  target: string;
  weight: number;
  label: string;
  appears: number; // 0-100 timeline position
}

const DISTRICT_DEFS: [string, number, number, number][] = [
  ["Bengaluru", 12.9716, 77.5946, 13600000],
  ["Mysuru", 12.2958, 76.6394, 3000000],
  ["Mangaluru", 12.9141, 74.856, 1900000],
  ["Hubballi", 15.3647, 75.124, 1100000],
  ["Kalaburagi", 17.3297, 76.8343, 2600000],
  ["Belagavi", 15.8497, 74.4977, 4800000],
  ["Tumakuru", 13.3409, 77.101, 2700000],
  ["Shivamogga", 13.9299, 75.5681, 1750000],
];

const CRIME_TYPES = [
  "Vehicle Theft",
  "Burglary",
  "Assault",
  "Cyber Fraud",
  "Chain Snatching",
  "Narcotics",
  "Robbery",
  "Missing Person",
  "Murder",
  "Extortion",
];

const FIRST_NAMES = ["Ravi", "Suresh", "Anita", "Manjunath", "Lakshmi", "Imran", "Deepak", "Kavya", "Naveen", "Pradeep", "Shankar", "Rekha", "Vijay", "Gopal", "Farhan", "Bhavana"];
const LAST_NAMES = ["Gowda", "Shetty", "Rao", "Naik", "Reddy", "Patil", "Hegde", "Kulkarni", "Iyer", "Khan", "Murthy", "Desai"];
const RANKS = ["DGP", "IGP", "SP", "DySP", "Inspector", "Sub-Inspector", "ASI"];
const ALIASES = ["Chotu", "Anna", "Bullet", "Kala", "Tiger", "Bhai", "Silent", "Maddy"];

function name(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}
function dateWithin(daysBack: number): string {
  const d = new Date(2026, 5, 27, 8, 0, 0);
  d.setDate(d.getDate() - int(0, daysBack));
  d.setHours(int(0, 23), int(0, 59));
  return d.toISOString();
}

function buildData() {
  reseed(0x5151abcd);

  const districts: District[] = DISTRICT_DEFS.map((d, i) => ({
    id: `D${i + 1}`,
    name: d[0],
    lat: d[1],
    lng: d[2],
    population: d[3],
    crimeIndex: int(28, 96),
    activeCases: int(40, 420),
    trend: int(-18, 34),
  }));

  const officers: Officer[] = Array.from({ length: 18 }, (_, i) => {
    const dist = pick(districts);
    return {
      id: `OFF${100 + i}`,
      name: name(),
      rank: i === 0 ? "DGP" : pick(RANKS.slice(1)),
      district: dist.name,
      badge: `KSP-${int(1000, 9999)}`,
      station: `${dist.name} ${pick(["City", "North", "South", "Rural", "East"])} PS`,
      caseload: int(3, 24),
      avatarHue: int(0, 360),
    };
  });

  const vehicles: Vehicle[] = Array.from({ length: 14 }, () => ({
    id: `VEH${int(100, 999)}`,
    plate: `KA-${int(1, 70).toString().padStart(2, "0")}-${pick(["AB", "CK", "MN", "HF", "JZ"])}-${int(1000, 9999)}`,
    model: pick(["Bajaj Pulsar", "Maruti Swift", "Hyundai i20", "Royal Enfield", "TVS Apache", "Mahindra Bolero", "Honda Activa"]),
    color: pick(["Black", "White", "Silver", "Red", "Grey"]),
    flag: pick(["ANPR Hit", "Stolen", "Watchlist", "Clean", "Suspect"]),
  }));

  const firs: FIR[] = Array.from({ length: 40 }, (_, i) => {
    const dist = pick(districts);
    return {
      id: `FIRID${i}`,
      number: `${int(1, 600).toString().padStart(4, "0")}/2026`,
      type: pick(CRIME_TYPES),
      district: dist.name,
      station: `${dist.name} ${pick(["City", "North", "Rural"])} PS`,
      date: dateWithin(45),
      status: pick<CaseStatus>(["open", "investigating", "pending", "closed"]),
    };
  });

  const suspects: Suspect[] = Array.from({ length: 16 }, (_, i) => {
    const dist = pick(districts);
    return {
      id: `SUS${200 + i}`,
      name: name(),
      alias: pick(ALIASES),
      age: int(19, 54),
      district: dist.name,
      riskScore: int(35, 98),
      priors: int(0, 11),
      status: pick(["wanted", "monitored", "detained", "released"]),
    };
  });

  const cases: CaseRecord[] = Array.from({ length: 24 }, (_, i) => {
    const dist = pick(districts);
    const off = pick(officers);
    const type = pick(CRIME_TYPES);
    const opened = dateWithin(60);
    return {
      id: `CASE${500 + i}`,
      fir: `${int(1, 600).toString().padStart(4, "0")}/2026`,
      title: `${type} — ${dist.name} ${pick(["Sector", "Ward", "Layout", "Market"])} ${int(1, 40)}`,
      type,
      district: dist.name,
      station: `${dist.name} ${pick(["City", "North", "Rural"])} PS`,
      priority: pick<Severity>(["critical", "high", "medium", "low"]),
      status: pick<CaseStatus>(["open", "investigating", "pending", "closed"]),
      officerId: off.id,
      opened,
      updated: dateWithin(5),
      victims: Array.from({ length: int(1, 3) }, () => ({ name: name(), age: int(16, 70), gender: pick(["M", "F"]) })),
      accused: Array.from({ length: int(1, 4) }, () => ({ name: name(), status: pick(["arrested", "absconding", "on bail", "charged"]) })),
      evidence: Array.from({ length: int(2, 5) }, (_, e) => ({
        id: `EV${i}${e}`,
        type: pick(["CCTV", "Forensic", "Digital", "Witness", "Physical"]),
        label: pick(["CCTV footage — junction cam", "DNA swab", "Mobile call records", "Recovered weapon", "ANPR capture", "Fingerprint lift"]),
        collected: dateWithin(40),
        chain: pick(["Sealed", "Lab", "Court", "Storage"]),
      })),
      timeline: Array.from({ length: int(4, 7) }, (_, t) => ({
        time: dateWithin(50 - t * 5),
        label: pick(["FIR registered", "Site inspection", "Witness statement", "Suspect identified", "Evidence collected", "Arrest made", "Charge sheet filed", "Forensic report received"]),
        actor: pick(officers).name,
      })).sort((a, b) => +new Date(a.time) - +new Date(b.time)),
      related: [],
      summary: `Reported ${type.toLowerCase()} in ${dist.name}. ${int(1, 4)} accused identified, ${int(0, 3)} arrests made. Investigation ${pick(["ongoing", "advancing", "awaiting forensics"])}.`,
    };
  });
  // wire related cases
  cases.forEach((c) => {
    c.related = Array.from({ length: int(1, 3) }, () => pick(cases).id).filter((id) => id !== c.id);
  });

  const alerts: Alert[] = Array.from({ length: 12 }, (_, i) => {
    const dist = pick(districts);
    const templates = [
      ["Vehicle theft cluster detected", "ANPR Grid"],
      ["Repeat offender match", "Facial Recognition"],
      ["ANPR hit — watchlist vehicle", "ANPR Grid"],
      ["Crime hotspot forming", "Predictive Engine"],
      ["Chain snatching spike", "Patrol Reports"],
      ["Cyber fraud pattern detected", "Cyber Cell"],
      ["Repeat location burglary", "Beat Intelligence"],
    ];
    const t = pick(templates);
    return {
      id: `ALR${i}`,
      severity: pick<Severity>(["critical", "high", "medium", "low"]),
      title: t[0],
      district: dist.name,
      timestamp: dateWithin(1),
      source: t[1],
      action: pick(["Dispatch unit", "Assign officer", "Open case", "Notify SP", "Escalate"]),
    };
  }).sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

  const recommendations: AIRecommendation[] = [
    {
      id: "AI1",
      title: "Deploy patrol to Bengaluru East corridor",
      summary: "Vehicle theft incidents rose 34% overnight along the East ORR corridor, concentrated near transit hubs between 01:00–04:00.",
      confidence: 87,
      evidence: ["7 FIRs in 6 hrs (KA-03 zone)", "3 ANPR hits on flagged plates", "Matches Q2 theft signature"],
      action: "Dispatch patrol",
      why: "Theft incidents are clustering in a narrow time window around East ORR transit hubs, matching a known organized-theft signature. Early patrol presence disrupts the active window before the next likely strike.",
      riskFactors: ["Night Hours", "Transit Hub", "Repeat Offender", "Recent Hotspot"],
      reasoning: [
        "Detected 7 vehicle-theft FIRs within 6 hours in the KA-03 zone — 34% above the rolling baseline.",
        "ANPR captured 3 flagged plates re-entering the corridor between 01:00–04:00.",
        "Spatial-temporal pattern matches the Q2 theft signature with 0.84 similarity.",
        "Two involved suspects have prior vehicle-theft convictions in adjacent wards.",
        "Forecast model places the next likely incident inside the same 3 km corridor.",
      ],
      predictedImpact: "~38% reduction in overnight vehicle theft along the corridor within 72 hours.",
    },
    {
      id: "AI2",
      title: "Flag repeat offender network — Mysuru",
      summary: "Three suspects share vehicles and FIRs across 4 recent burglaries, indicating an organized cell operating in Mysuru South.",
      confidence: 79,
      evidence: ["Shared vehicle KA-09-MN-4821", "2 co-accused links", "Overlapping timelines", "Repeat offender detected"],
      action: "Open network case",
      why: "Independent FIRs converge on the same vehicle and co-accused, which is a strong indicator of a single coordinated cell rather than isolated crimes. Consolidating them enables one network investigation.",
      riskFactors: ["Repeat Offender", "High Population Density", "Night Hours"],
      reasoning: [
        "Vehicle KA-09-MN-4821 appears in 3 of 4 burglary FIRs across Mysuru South.",
        "Two suspects are named as co-accused in separate cases, linking the clusters.",
        "Incident timestamps overlap on two nights, suggesting joint operation.",
        "Combined prior-offence count across the trio exceeds the cell threshold.",
        "Network density score crosses the organized-group flag.",
      ],
      predictedImpact: "Linking cases could improve clearance rate by ~25% and prevent 2–3 follow-on burglaries.",
    },
    {
      id: "AI3",
      title: "Forecast: chain snatching spike — Hubballi",
      summary: "Time-series model predicts elevated chain snatching risk in Hubballi market wards over the next 48 hours based on seasonal pattern.",
      confidence: 72,
      evidence: ["14-day rising trend", "Festival footfall surge", "Historical correlation 0.81", "Recent hotspot"],
      action: "Increase beat coverage",
      why: "Seasonal footfall plus a rising local trend historically precedes chain-snatching spikes in crowded market wards. Pre-positioning beats during peak hours suppresses opportunistic offences.",
      riskFactors: ["Festival Season", "High Population Density", "Transit Hub"],
      reasoning: [
        "14-day moving average for chain snatching is trending upward in Hubballi market wards.",
        "Festival footfall is projected to surge over the next 48 hours.",
        "Historical correlation between footfall and snatching incidents is 0.81.",
        "Two market wards already crossed the early-hotspot threshold.",
        "Model confidence interval places the spike within the coming 2 days.",
      ],
      predictedImpact: "Targeted beat coverage could cut projected chain-snatching incidents by ~30%.",
    },
  ];

  // Network graph
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  suspects.slice(0, 9).forEach((s, i) =>
    nodes.push({ id: s.id, label: s.name, kind: "person", risk: s.riskScore, pinned: i === 0, firstSeen: int(0, 40) })
  );
  vehicles.slice(0, 6).forEach((v) => nodes.push({ id: v.id, label: v.plate, kind: "vehicle", risk: int(20, 80), firstSeen: int(10, 70) }));
  districts.slice(0, 5).forEach((d) => nodes.push({ id: `LOC${d.id}`, label: d.name, kind: "location", risk: d.crimeIndex, firstSeen: int(0, 30) }));
  firs.slice(0, 8).forEach((f) => nodes.push({ id: f.id, label: `FIR ${f.number}`, kind: "fir", risk: int(30, 70), firstSeen: int(20, 90) }));

  const persons = nodes.filter((n) => n.kind === "person");
  const others = nodes.filter((n) => n.kind !== "person");
  persons.forEach((p) => {
    const n = int(1, 3);
    for (let k = 0; k < n; k++) {
      const tgt = pick(others);
      links.push({
        source: p.id,
        target: tgt.id,
        weight: int(1, 5),
        label: tgt.kind === "vehicle" ? "uses" : tgt.kind === "location" ? "operates in" : "named in",
        appears: int(0, 100),
      });
    }
  });
  // person-person associates
  for (let k = 0; k < 7; k++) {
    const a = pick(persons);
    const b = pick(persons);
    if (a.id !== b.id) links.push({ source: a.id, target: b.id, weight: int(1, 4), label: "associate", appears: int(0, 100) });
  }

  const notifications = [
    { id: "N1", icon: "car", title: "Vehicle theft detected", body: "KA-03-AB-2914 flagged near Whitefield", time: dateWithin(0), severity: "high" as Severity },
    { id: "N2", icon: "user", title: "Repeat offender matched", body: "Suspect 'Tiger' identified in Mysuru CCTV", time: dateWithin(0), severity: "critical" as Severity },
    { id: "N3", icon: "scan", title: "ANPR hit", body: "Watchlist plate captured — Hubballi toll", time: dateWithin(0), severity: "medium" as Severity },
    { id: "N4", icon: "map", title: "Crime hotspot formed", body: "Cluster forming in Kalaburagi Ward 12", time: dateWithin(1), severity: "high" as Severity },
    { id: "N5", icon: "badge", title: "Officer assignment", body: "Insp. Gowda assigned CASE-512", time: dateWithin(1), severity: "low" as Severity },
    { id: "N6", icon: "file", title: "Report generated", body: "Morning briefing pack ready", time: dateWithin(1), severity: "low" as Severity },
  ];

  // crime trend series (14 days) + hourly heat (24h)
  const trendSeries = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(2026, 5, 14 + i);
    const row: Record<string, number | string> = { day: `${day.getDate()}/${day.getMonth() + 1}` };
    districts.slice(0, 4).forEach((d) => (row[d.name] = int(8, 60)));
    return row;
  });
  const forecastSeries = Array.from({ length: 21 }, (_, i) => {
    const actual = i < 14 ? int(20, 55) : null;
    const predicted = i >= 13 ? int(22, 58) : null;
    return { day: `D${i + 1}`, actual, predicted };
  });
  const hourlyHeat = Array.from({ length: 24 }, (_, h) => ({ hour: h, value: int(2, 40) + (h >= 22 || h <= 4 ? 25 : 0) }));

  // Police stations per district (hierarchical drill-down layer)
  const AREA_NAMES: Record<string, string[]> = {
    Bengaluru: ["Whitefield", "Koramangala", "Indiranagar", "Jayanagar", "Electronic City", "Yelahanka", "Hebbal"],
    Mysuru: ["Devaraja", "Krishnaraja", "Vijayanagar", "Nazarbad", "Kuvempunagar"],
    Mangaluru: ["Pandeshwar", "Kadri", "Surathkal", "Bunder", "Ullal"],
    Hubballi: ["Vidyanagar", "Gokul Road", "Old Hubballi", "Keshwapur", "Navanagar"],
    Kalaburagi: ["Brahmapur", "Station Bazar", "MB Nagar", "Roza", "Aland Road"],
    Belagavi: ["Camp", "Tilakwadi", "Shahapur", "Market", "Vadgaon"],
    Tumakuru: ["Town", "Batawadi", "Kyathsandra", "Sira Gate", "Antharasanahalli"],
    Shivamogga: ["Doddapet", "Vinoba Nagar", "Tunga Nagar", "Kote", "Gopala"],
  };
  const GENERIC_AREAS = ["City", "North", "South", "East", "West", "Central", "Market", "Rural"];
  const stations: PoliceStation[] = [];
  districts.forEach((d) => {
    const areas = AREA_NAMES[d.name] ?? GENERIC_AREAS;
    const count = int(4, 6);
    for (let i = 0; i < count; i++) {
      const area = areas[i % areas.length];
      stations.push({
        id: `${d.id}-PS${i + 1}`,
        name: `${area} Police Station`,
        districtId: d.id,
        district: d.name,
        lat: d.lat + (rng() - 0.5) * 0.16,
        lng: d.lng + (rng() - 0.5) * 0.16,
        crimeIndex: int(20, 95),
        activeCases: int(8, 90),
        trend: int(-20, 36),
        officerInCharge: name(),
      });
    }
  });

  // ---- Extended analytics datasets (deterministic) ----
  const crimeTypeDistribution = CRIME_TYPES.map((type) => ({ type, value: int(40, 480) }))
    .sort((a, b) => b.value - a.value);

  const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthlyTrend = MONTHS.map((month) => ({
    month,
    incidents: int(620, 1480),
    resolved: int(380, 1000),
  }));

  const weaponUsage = [
    "Knife / Sharp Object",
    "Firearm",
    "Blunt Object",
    "Vehicle",
    "Explosive",
    "Unarmed",
    "Other",
  ].map((weapon) => ({ weapon, value: int(30, 360) })).sort((a, b) => b.value - a.value);

  const victimAgeDistribution = ["0-12", "13-18", "19-25", "26-35", "36-45", "46-60", "60+"].map(
    (band) => ({ band, value: int(45, 420) })
  );

  const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const crimeByWeekday = WEEKDAYS.map((day) => ({
    day,
    value: int(180, 540) + (day === "Sat" || day === "Sun" ? 120 : 0),
  }));

  const repeatCrimeFrequency = [
    "First Offence",
    "2nd Offence",
    "3rd Offence",
    "4th Offence",
    "5+ Offences",
  ].map((band) => ({ band, value: int(40, 600) })).sort((a, b) => b.value - a.value);

  const topStations = [...stations]
    .sort((a, b) => b.activeCases - a.activeCases)
    .slice(0, 10)
    .map((s) => ({ name: `${s.name} (${s.district})`, value: s.activeCases }));

  const severityDistribution = (["critical", "high", "medium", "low"] as Severity[]).map(
    (severity) => ({ severity, value: int(60, 520) })
  );


  return {
    districts,
    officers,
    vehicles,
    firs,
    suspects,
    cases,
    alerts,
    recommendations,
    nodes,
    links,
    notifications,
    trendSeries,
    forecastSeries,
    hourlyHeat,
    stations,
    crimeTypeDistribution,
    monthlyTrend,
    weaponUsage,
    victimAgeDistribution,
    crimeByWeekday,
    repeatCrimeFrequency,
    topStations,
    severityDistribution,
  };

}

export const DB = buildData();
export const currentOfficer: Officer = {
  id: "OFF-DGP",
  name: "Arvind Kumar Gowda",
  rank: "Director General of Police",
  district: "Karnataka State",
  badge: "KSP-0001",
  station: "State Crime Records Bureau (SCRB)",
  caseload: 0,
  avatarHue: 190,
};

export function officerById(id: string): Officer | undefined {
  return DB.officers.find((o) => o.id === id);
}
export function caseById(id: string): CaseRecord | undefined {
  return DB.cases.find((c) => c.id === id);
}
export function stationsForDistrict(districtId: string): PoliceStation[] {
  return DB.stations.filter((s) => s.districtId === districtId);
}
