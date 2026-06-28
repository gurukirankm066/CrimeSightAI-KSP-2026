import { createFileRoute } from "@tanstack/react-router";
import { InvestigationPage } from "@/modules/investigation/InvestigationPage";

export const Route = createFileRoute("/investigation-v2")({
  component: InvestigationPage,
});