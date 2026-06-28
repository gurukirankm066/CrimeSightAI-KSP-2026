import { useEffect, useState } from "react";
import { getCases } from "./services/api";
import type { InvestigationCase } from "./types/investigation";
import { CaseList } from "./components/CaseList";
import { CaseDetails } from "./components/CaseDetails";

export function InvestigationPage() {
    const [cases, setCases] = useState<InvestigationCase[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await getCases();

                if (res.success) {
                    setCases(res.data);

                    if (res.data.length > 0) {
                        setSelectedId(res.data[0].id);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const selectedCase =
        cases.find((c) => c.id === selectedId);

    if (loading) {
        return (
            <div className="p-6 text-lg">
                Loading cases...
            </div>
        );
    }

    return (
        <div className="p-6">

            <h1 className="mb-6 text-3xl font-bold">
                Investigation V2
            </h1>

            <div className="grid grid-cols-12 gap-6">

                <div className="col-span-4">

                    <CaseList
                        cases={cases}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />

                </div>

                <div className="col-span-8">

                    <CaseDetails
                        data={selectedCase}
                    />

                </div>

            </div>

        </div>
    );
}