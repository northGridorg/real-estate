import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Apple, Fingerprint, ShieldCheck } from "lucide-react";
import { useState } from "react";

import loginHero from "@/assets/login-hero.jpg";
import { Field, inputCls } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import { useFlow } from "@/state/flow";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Broker Sign In — NorthGrid Dubai" },
      {
        name: "description",
        content:
          "Sign in to the NorthGrid Dubai broker desk with Emirates ID, mobile OTP, username, UAE PASS, Google or Apple ID.",
      },
      { property: "og:title", content: "Broker Sign In — NorthGrid Dubai" },
      {
        property: "og:description",
        content:
          "Emirates ID, mobile OTP, UAE PASS, Google or Apple ID sign-in for Dubai property brokers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginScreen,
});

type Method = "emirates" | "mobile" | "username";

const METHODS: { id: Method; label: string }[] = [
  { id: "username", label: "Username" },
  { id: "mobile", label: "Mobile" },
  { id: "emirates", label: "Emirates ID" },
];

function LoginScreen() {
  const { signIn } = useFlow();
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("username");
  const [loading, setLoading] = useState<string | null>(null);

  const enter = (mode: string) => {
    setLoading(mode);
    setTimeout(() => {
      signIn();
      navigate({ to: "/" });
    }, 700);
  };

  const primaryLabel =
    method === "emirates" ? "Send OTP" : method === "mobile" ? "Send OTP" : "Sign In";

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-secondary/40 px-0 py-0 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
      <div className="mx-auto grid max-h-full w-full max-w-[1240px] overflow-y-auto rounded-none border-border bg-card shadow-sm sm:rounded-3xl sm:border lg:grid-cols-[1fr_1fr]">
        {/* Hero */}
        <div className="relative hidden min-h-[520px] lg:block">
          <img
            src={loginHero}
            alt="Dubai waterfront luxury tower"
            width={960}
            height={1280}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" />
          <div className="relative flex h-full flex-col justify-between p-8 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <span className="text-[17px] font-semibold leading-tight">
                NorthGrid
                <span className="block text-[12px] font-normal opacity-80">
                  Dubai Broker Desk
                </span>
              </span>
            </div>
            <div className="space-y-2">
              <h2 className="text-[34px] font-semibold leading-tight tracking-tight">
                Sell Dubai&apos;s best addresses
              </h2>
              <p className="max-w-[380px] text-[14px] opacity-85">
                Secondary &amp; off-plan inventory, client matching, offers and DLD-ready deal
                paperwork in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex min-h-[100dvh] flex-col justify-center gap-6 px-6 py-10 sm:min-h-0 sm:px-10 sm:py-12">
          <div className="space-y-1">
            <h1 className="text-[26px] font-semibold tracking-tight sm:text-[30px]">
              Welcome back, agent
            </h1>
            <p className="text-[13px] text-muted-foreground">Login via</p>
          </div>

          {/* Method tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-secondary/70 p-1">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={cn(
                  "touch-target rounded-xl px-2 text-[13px] font-semibold",
                  method === m.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex min-h-[156px] flex-col justify-center gap-3">
            {method === "emirates" ? (
              <Field label="Emirates ID number">
                <input className={inputCls} placeholder="784-xxxx-xxxxxxx-x" inputMode="numeric" />
              </Field>
            ) : method === "mobile" ? (
              <Field label="Mobile number">
                <input className={inputCls} placeholder="+971 5x xxx xxxx" inputMode="tel" />
              </Field>
            ) : (
              <>
                <Field label="Username">
                  <input className={inputCls} defaultValue="y.haddad@northgrid.ae" />
                </Field>
                <Field label="Password">
                  <input className={inputCls} type="password" defaultValue="••••••••" />
                </Field>
              </>
            )}
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--primary)]" />
                Remember me
              </label>
              <button type="button" className="font-medium text-primary">
                Forgot password?
              </button>
            </div>

            <button
              type="button"
              onClick={() => enter("primary")}
              className="touch-target w-full rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground active:opacity-90"
            >
              {loading === "primary" ? "Signing in…" : primaryLabel}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Instant log in
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => enter("uaepass")}
              className="touch-target flex items-center justify-center gap-2 rounded-2xl border border-border bg-card text-[14px] font-medium active:bg-secondary/60"
            >
              <Fingerprint className="h-5 w-5 text-primary" />
              {loading === "uaepass" ? "Opening UAE PASS…" : "UAE PASS"}
            </button>
            <button
              type="button"
              onClick={() => enter("google")}
              className="touch-target flex items-center justify-center gap-2 rounded-2xl border border-border bg-card text-[14px] font-medium active:bg-secondary/60"
            >
              <GoogleMark />
              Google
            </button>
            <button
              type="button"
              onClick={() => enter("apple")}
              className="touch-target flex items-center justify-center gap-2 rounded-2xl border border-border bg-card text-[14px] font-medium active:bg-secondary/60"
            >
              <Apple className="h-5 w-5" />
              Apple ID
            </button>
          </div>


          <p className="text-center text-[12px] text-muted-foreground">
            Not registered?{" "}
            <button type="button" className="font-semibold text-primary">
              Register as a broker
            </button>
          </p>
          <p className="text-center text-[11px] text-muted-foreground">
            RERA BRN 48219 · Data resident in AWS me-central-1 (Dubai)
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.73 4.1-5.5 4.1A6.2 6.2 0 1 1 12 5.8c1.6 0 2.9.6 3.8 1.4l2.6-2.5C16.8 3.2 14.6 2.3 12 2.3a9.7 9.7 0 1 0 0 19.4c5.6 0 9.3-3.9 9.3-9.4 0-.7-.1-1.3-.2-1.8H12z"
      />
    </svg>
  );
}
