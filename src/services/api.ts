const BASE_URL =
    "https://crimesightai-ksp-60075226836.development.catalystserverless.in/server/crime_sight_ai_ksp_function";

export async function getDashboard() {
    const res = await fetch(`${BASE_URL}/dashboard`);
    return await res.json();
}

export async function getCases() {
    const res = await fetch(`${BASE_URL}/cases`);
    const json = await res.json();

    if (!json.success) {
        return json;
    }

    return {
        success: true,
        data: json.data.map((c: any) => ({
            id: c.ROWID,
            ROWID: c.ROWID,

            title: c.place_of_occurrence,
            fir: c.fir_number,

            priority: (c.case_priority || "").toLowerCase(),
            status: (c.case_status || "").toLowerCase(),

            district: c.district_rowid,
            station: c.unit_rowid,

            opened: c.occurrence_datetime,
            updated: c.MODIFIEDTIME,

            summary: c.ai_summary,

            victims: [],
            accused: [],
            evidence: [],
            timeline: [],
            related: [],

            officerId: c.investigation_officer_rowid,
            type: "Crime",
        })),
    };
}

export async function getCase(id: string) {
    const res = await fetch(`${BASE_URL}/case/${id}`);
    const json = await res.json();

    if (!json.success) {
        return json;
    }

    const c = json.data;

    return {
        success: true,
        data: {
            id: c.ROWID,
            ROWID: c.ROWID,

            title: c.place_of_occurrence,
            fir: c.fir_number,

            priority: (c.case_priority || "").toLowerCase(),
            status: (c.case_status || "").toLowerCase(),

            district: c.district_rowid,
            station: c.unit_rowid,

            opened: c.occurrence_datetime,
            updated: c.MODIFIEDTIME,

            summary: c.ai_summary,

            victims: [],
            accused: [],
            evidence: [],
            timeline: [],
            related: [],

            officerId: c.investigation_officer_rowid,
            type: "Crime",
        },
    };
}