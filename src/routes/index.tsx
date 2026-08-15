import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Broker Control Desk — Dubai Property Deal Room" },
      {
        name: "description",
        content:
          "Private broker control desk for Dubai secondary and off-plan sales: HNW CRM, DLD community data, fractional equity and prospectus packaging.",
      },
      { property: "og:title", content: "Broker Control Desk — Dubai Property Deal Room" },
      {
        property: "og:description",
        content:
          "Secondary and off-plan deal desk with DLD analytics, payment-plan tracking and client prospectus packaging.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/crm" });
  },
});
