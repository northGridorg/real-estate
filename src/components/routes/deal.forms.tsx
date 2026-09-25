import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, FileText, PenLine, Upload } from "lucide-react";
import { toast } from "sonner";

import MobileShell from "@/components/app/MobileShell";
import { BigButton, Panel, Tag } from "@/components/app/ui";
import { DOC_TEMPLATES } from "@/data/app";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/deal/forms")({
  head: () => ({
    meta: [
      { title: "Forms & Documents — NorthGrid" },
      {
        name: "description",
        content: "Upload, review and sign Form A, Form B, Form F and supporting deal documents.",
      },
      { property: "og:title", content: "Forms & Documents — NorthGrid" },
      {
        property: "og:description",
        content: "RERA forms and buyer documents tracked from missing to signed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FormsScreen,
});

function FormsScreen() {
  const navigate = useNavigate();
  const { docs, setDoc, setDealStage } = useFlow();
  const required = ["form-a", "form-b", "form-f"];
  const allSigned = required.every((id) => docs[id] === "SIGNED");

  return (
    <MobileShell title="Forms & Documents" subtitle="RERA forms and buyer file" back>
      {DOC_TEMPLATES.map((d) => {
        const state = docs[d.id];
        return (
          <Panel
            key={d.id}
            title={d.label}
            hint={d.hint}
            trailing={
              <Tag tone={state === "SIGNED" ? "primary" : state === "UPLOADED" ? "warning" : "muted"}>
                {state}
              </Tag>
            }
          >
            <div className="grid grid-cols-3 gap-2">
              <BigButton
                tone="outline"
                icon={<Upload className="h-4 w-4" />}
                onClick={() => {
                  setDoc(d.id, "UPLOADED");
                  toast.success(`${d.label} uploaded`);
                }}
              >
                Upload
              </BigButton>
              <BigButton
                tone="ghost"
                icon={<FileText className="h-4 w-4" />}
                onClick={() => toast(`${d.label} opened for review`)}
              >
                Review
              </BigButton>
              <BigButton
                icon={<PenLine className="h-4 w-4" />}
                onClick={() => {
                  setDoc(d.id, "SIGNED");
                  toast.success(`${d.label} signed`);
                }}
              >
                Sign
              </BigButton>
            </div>
          </Panel>
        );
      })}

      <BigButton
        icon={<Check className="h-4 w-4" />}
        onClick={() => {
          if (!allSigned) {
            toast.error("Form A, Form B and Form F must be signed");
            return;
          }
          setDealStage("FORMS_DONE");
          navigate({ to: "/deal/payment" });
        }}
      >
        {allSigned ? "Documents signed · continue" : "Sign the three RERA forms"}
      </BigButton>
    </MobileShell>
  );
}
