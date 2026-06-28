export type CasePriority =
    | "critical"
    | "high"
    | "medium"
    | "low";

export type CaseStatus =
    | "open"
    | "investigating"
    | "pending"
    | "closed";

export interface InvestigationCase {
    id: string;
    fir: string;
    title: string;

    priority: CasePriority;
    status: string;

    district: string;
    station: string;

    opened: string;
    updated: string;

    summary: string;

    officerId: string;

    riskScore?: number;
}

export interface InvestigationResponse {
    success: boolean;
    data: InvestigationCase[];
}

export interface InvestigationDetailResponse {
    success: boolean;
    data: InvestigationCase;
}