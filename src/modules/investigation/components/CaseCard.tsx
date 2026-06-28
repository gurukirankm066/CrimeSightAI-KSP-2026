import type { InvestigationCase } from "../types/investigation";

interface Props {
    data: InvestigationCase;
    selected: boolean;
    onClick: () => void;
}

export function CaseCard({
    data,
    selected,
    onClick,
}: Props) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer rounded-lg border p-4 transition

      ${selected
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-zinc-800 hover:border-cyan-500"
                }`}
        >
            <h3 className="font-semibold">

                {data.title}

            </h3>

            <p className="text-sm opacity-70">

                {data.fir}

            </p>

            <div className="mt-2 flex gap-2">

                <span className="rounded bg-red-600 px-2 py-1 text-xs">

                    {data.priority}

                </span>

                <span className="rounded bg-zinc-700 px-2 py-1 text-xs">

                    {data.status}

                </span>

            </div>

        </div>
    );
}