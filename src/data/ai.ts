import { DB } from "./db";

export interface AIResponse {
  summary: string;
  confidence: number | null;
  evidence: string[];
  recommendation: string;
  action: string | null;
  /** route the primary action navigates to (null = no navigation) */
  actionTo?: string | null;
  insufficient?: boolean;
}

const ROUTE_CONTEXT: Record<string, AIResponse> = {
  "/": {
    summary:
      "Statewide crime activity is elevated overnight, led by a 34% rise in vehicle theft across Bengaluru East. Three districts show forming hotspots.",
    confidence: 86,
    evidence: ["7 vehicle-theft FIRs in 6 hrs (KA-03)", "3 ANPR watchlist hits", "Predictive engine flagged 2 new clusters"],
    recommendation: "Prioritize patrol redeployment to Bengaluru East ORR corridor and review the Mysuru repeat-offender network.",
    action: "Open Crime Analytics",
    actionTo: "/analytics",
  },
  "/morning-intelligence": {
    summary:
      "Overnight (00:00–06:00): 41 incidents logged, +18% vs 7-day average. Vehicle theft and chain snatching drove the increase; cyber fraud held steady.",
    confidence: 81,
    evidence: ["41 incidents vs 35 avg", "Bengaluru +34%, Hubballi +22%", "2 districts crossed alert threshold"],
    recommendation: "Issue the morning briefing pack to district SPs and assign investigation leads to the two spiking districts.",
    action: "Open Investigation Hub",
    actionTo: "/investigation",
  },
  "/investigation": {
    summary:
      "24 active cases. 6 are critical priority and 4 are awaiting forensic results. Two cases share an accused and may be linked.",
    confidence: 77,
    evidence: ["6 critical cases open", "2 cases share accused 'Tiger'", "4 cases pending forensics > 5 days"],
    recommendation: "Merge the two linked Mysuru burglary cases and escalate the 4 stalled forensic requests.",
    action: "Open Criminal Network",
    actionTo: "/criminal-network",
  },
  "/criminal-network": {
    summary:
      "The active network spans 9 persons, 6 vehicles and 8 FIRs. One high-risk node connects three otherwise-separate clusters.",
    confidence: 74,
    evidence: ["Bridge node risk 92", "Shared vehicle across 3 FIRs", "Dense associate sub-cluster (Mysuru)"],
    recommendation: "Focus surveillance on the bridge node and send the Mysuru sub-cluster to Investigation.",
    action: "Open Investigation Hub",
    actionTo: "/investigation",
  },
  "/analytics": {
    summary:
      "Bengaluru remains the dominant crime-load district. Forecast indicates a 14% rise in property crime statewide over the next 7 days.",
    confidence: 79,
    evidence: ["Bengaluru crime index 96", "14-day rising trend (r=0.81)", "Night-hour concentration 22:00–04:00"],
    recommendation: "Increase night-shift coverage in top-3 districts and pre-position units near forecast hotspots.",
    action: "Open Command Center",
    actionTo: "/",
  },
  "/profile": {
    summary:
      "Administration is nominal. 823 accounts are provisioned across 8 roles. 3 security events in the last 24h, including 1 locked account from failed 2FA.",
    confidence: 82,
    evidence: ["823 accounts · 8 roles", "1 account auto-locked (5 failed 2FA)", "Session timeout policy: 15m"],
    recommendation: "Review the locked Inspector account and confirm the recent DySP delete-permission grant on Investigation Hub.",
    action: "Open Audit History",
    actionTo: "/profile",
  },
};

export function routeLabel(pathname: string): string {
  switch (pathname) {
    case "/":
      return "Command Center";
    case "/morning-intelligence":
      return "Morning Intelligence";
    case "/investigation":
      return "Investigation Hub";
    case "/criminal-network":
      return "Criminal Network";
    case "/analytics":
      return "Crime Analytics";
    case "/profile":
      return "Administration";
    default:
      return "Command Center";
  }
}

export function aiAnswer(pathname: string, query?: string): AIResponse {
  const base = ROUTE_CONTEXT[pathname] ?? ROUTE_CONTEXT["/"];
  if (!query) return base;

  const q = query.toLowerCase();
  // simple synthetic retrieval over known data
  const district = DB.districts.find((d) => q.includes(d.name.toLowerCase()));
  if (district) {
    return {
      summary: `${district.name} has a crime index of ${district.crimeIndex} with ${district.activeCases} active cases and a ${district.trend > 0 ? "+" : ""}${district.trend}% overnight change.`,
      confidence: 84,
      evidence: [
        `Crime index ${district.crimeIndex}/100`,
        `${district.activeCases} active cases`,
        `Overnight trend ${district.trend > 0 ? "+" : ""}${district.trend}%`,
      ],
      recommendation:
        district.trend > 10
          ? `Spike detected — recommend deploying additional units to ${district.name} and opening a cluster review.`
          : `${district.name} is within normal range. Maintain standard patrol coverage.`,
      action: `View ${district.name} analytics`,
      actionTo: "/analytics",
    };
  }

  const suspect = DB.suspects.find((s) => q.includes(s.name.toLowerCase()) || q.includes(s.alias.toLowerCase()));
  if (suspect) {
    return {
      summary: `${suspect.name} (alias "${suspect.alias}") has a risk score of ${suspect.riskScore} with ${suspect.priors} priors. Current status: ${suspect.status}.`,
      confidence: 80,
      evidence: [`Risk score ${suspect.riskScore}/100`, `${suspect.priors} prior offences`, `Base district ${suspect.district}`],
      recommendation: suspect.riskScore > 75 ? "High-risk subject — recommend network analysis and active monitoring." : "Continue standard monitoring.",
      action: "Open in Criminal Network",
      actionTo: "/criminal-network",
    };
  }

  // case / FIR lookup
  const caseMatch = DB.cases.find((c) => q.includes(c.id.toLowerCase()) || q.includes(c.fir.toLowerCase()) || q.includes(c.title.toLowerCase()));
  if (caseMatch) {
    return {
      summary: `${caseMatch.title} (${caseMatch.id}, FIR ${caseMatch.fir}) is ${caseMatch.priority} priority and currently ${caseMatch.status}. ${caseMatch.accused.length} accused, ${caseMatch.evidence.length} evidence items logged.`,
      confidence: 78,
      evidence: [`Priority ${caseMatch.priority}`, `${caseMatch.evidence.length} evidence items`, `${caseMatch.related.length} linked cases`],
      recommendation:
        caseMatch.priority === "critical"
          ? "Critical case — accelerate forensics and assign a dedicated investigation lead."
          : "Maintain investigation cadence and review linked cases for shared suspects.",
      action: "Open Investigation Hub",
      actionTo: "/investigation",
    };
  }

  if (q.includes("overnight") || q.includes("morning") || q.includes("briefing")) {
    return ROUTE_CONTEXT["/morning-intelligence"];
  }
  if (q.includes("network") || q.includes("associate") || q.includes("cluster")) {
    return ROUTE_CONTEXT["/criminal-network"];
  }
  if (q.includes("forecast") || q.includes("trend") || q.includes("theft") || q.includes("vehicle")) {
    return ROUTE_CONTEXT["/analytics"];
  }

  // No grounded data
  return {
    summary: "No grounded records match this query in the available synthetic dataset.",
    confidence: null,
    evidence: [],
    recommendation: "Refine the query to a known district, suspect, FIR, vehicle, or crime type.",
    action: null,
    actionTo: null,
    insufficient: true,
  };
}
