export function mapCases(data: any[]) {

    console.log("RAW CASE =", data[0]);

    return data.map((c: any) => ({
        id: c.ROWID,

        fir: c.fir_number,

        title: c.place_of_occurrence,

        type: "General Crime",

        district: c.district_rowid,

        station: c.unit_rowid,

        priority:
            (c.case_priority || "").toLowerCase() === "critical"
                ? "critical"
                : (c.case_priority || "").toLowerCase() === "high"
                    ? "high"
                    : (c.case_priority || "").toLowerCase() === "medium"
                        ? "medium"
                        : "low",

        status:
            (c.case_status || "").toLowerCase().includes("investigation")
                ? "investigating"
                : (c.case_status || "").toLowerCase(),

        officerId: "",

        opened: c.complaint_datetime,

        updated: c.MODIFIEDTIME,

        summary: c.ai_summary,

        victims: [],

        accused: [],

        evidence: [],

        timeline: [],

        related: []

    }));
}