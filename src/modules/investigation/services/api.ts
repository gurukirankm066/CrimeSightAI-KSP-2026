import type {
    InvestigationResponse,
    InvestigationDetailResponse
} from "../types/investigation";

const BASE_URL =
    "https://crimesightai-ksp-60075226836.development.catalystserverless.in/server/crime_sight_ai_ksp_function";

export async function getCases(): Promise<InvestigationResponse> {
    const res = await fetch(`${BASE_URL}/cases`);
    const json = await res.json();

    return {
        success: true,
        data: json.data.map((c: any) => ({
            id: c.ROWID,
            fir: c.fir_number,
            title: c.place_of_occurrence,

            priority: (c.case_priority || "").toLowerCase(),

            status: (c.case_status || "").toLowerCase(),

            district: c.district_rowid,
            station: c.unit_rowid,

            opened: c.occurrence_datetime,
            updated: c.MODIFIEDTIME,

            summary: c.ai_summary,

            officerId: c.investigation_officer_rowid,

            riskScore: c.ai_risk_score
        }))
    };
}

export async function getCase(
    id: string
): Promise<InvestigationDetailResponse> {

    const res = await fetch(`${BASE_URL}/case/${id}`);
    const json = await res.json();

    const c = json.data;

    return {
        success: true,
        data: {
            id: c.ROWID,
            fir: c.fir_number,
            title: c.place_of_occurrence,

            priority: (c.case_priority || "").toLowerCase(),

            status: (c.case_status || "").toLowerCase(),

            district: c.district_rowid,
            station: c.unit_rowid,

            opened: c.occurrence_datetime,
            updated: c.MODIFIEDTIME,

            summary: c.ai_summary,

            officerId: c.investigation_officer_rowid,

            riskScore: c.ai_risk_score
        }
    };
}