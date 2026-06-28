import { CaseCard } from "./CaseCard";
import type { InvestigationCase } from "../types/investigation";

interface Props {
    cases: InvestigationCase[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export function CaseList({
    cases,
    selectedId,
    onSelect,
}: Props) {
    return (
        <div className="space-y-3">
            {cases.map((c) => (
                <CaseCard
                    key={c.id}
                    data={c}
                    selected={c.id === selectedId}
                    onClick={() => onSelect(c.id)}
                />
            ))}

            {cases.length === 0 && (
                <div className="rounded-lg border border-zinc-800 p-6 text-center text-zinc-400">
                    No cases found.
                </div>
            )}
        </div>
    );
}