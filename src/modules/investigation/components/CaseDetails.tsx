import type { InvestigationCase } from "../types/investigation";

interface Props {
    data?: InvestigationCase;
}

export function CaseDetails({ data }: Props) {
    if (!data) {
        return (
            <div className="rounded-xl border border-zinc-800 p-8">
                Select a case
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-zinc-800 p-6 space-y-6">

            <div>
                <h2 className="text-2xl font-bold">
                    {data.title}
                </h2>

                <p className="text-zinc-400 mt-1">
                    {data.fir}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">

                <Info
                    label="Priority"
                    value={data.priority}
                />

                <Info
                    label="Status"
                    value={data.status}
                />

                <Info
                    label="District"
                    value={data.district}
                />

                <Info
                    label="Station"
                    value={data.station}
                />

                <Info
                    label="Risk Score"
                    value={String(data.riskScore ?? "-")}
                />

            </div>

            <div>

                <h3 className="font-semibold mb-2">

                    AI Summary

                </h3>

                <p className="text-zinc-300">

                    {data.summary}

                </p>

            </div>

        </div>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded border border-zinc-800 p-3">
            <p className="text-xs text-zinc-500">
                {label}
            </p>

            <p className="font-semibold mt-1">
                {value}
            </p>
        </div>
    );
}