// app/login/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff, Mail, Lock, Loader2, Chrome, ArrowRight } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";

// Animation presets — slide in from the left (no background styling)
const pageEnter = {
  hidden: { opacity: 0, x: -40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.06 },
  },
};
const itemEnter = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const emailIsValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  function humanizeFirebaseError(message?: string): string {
    if (!message) return "Sign-in failed. Please try again.";
    const m = message.toLowerCase();
    if (m.includes("network") || m.includes("timeout")) return "Network error. Check your connection and try again.";
    if (m.includes("invalid-credential") || m.includes("wrong-password")) return "Invalid email or password.";
    if (m.includes("user-not-found")) return "Account not found.";
    if (m.includes("too-many-requests")) return "Too many attempts. Please wait and retry.";
    if (m.includes("popup-closed")) return "Google sign-in was cancelled.";
    return message;
  }

  async function afterFirebaseSignIn() {
    const idToken = await clientAuth.currentUser!.getIdToken(true);
    const res = await fetch("/api/auth/sessionLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Session failed");
    router.push(next);
    router.refresh();
  }

  const signInGoogle = async () => {
    try {
      setErr(null);
      setLoading(true);
      await signInWithPopup(clientAuth, new GoogleAuthProvider());
      await afterFirebaseSignIn();
    } catch (e: any) {
      setErr(humanizeFirebaseError(e?.message));
    } finally {
      setLoading(false);
    }
  };

  const signInEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErr(null);
      setLoading(true);
      await signInWithEmailAndPassword(clientAuth, email.trim(), pass);
      await afterFirebaseSignIn();
    } catch (e: any) {
      setErr(humanizeFirebaseError(e?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-svh w-full bg-white">
      <section className="mx-auto flex min-h-svh max-w-6xl items-center justify-center px-4 py-10">
        <motion.div
          variants={pageEnter}
          initial="hidden"
          animate="show"
          className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
        >
          {/* Indigo accent rail */}
          <motion.span
            aria-hidden
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute left-0 top-0 h-full w-4.5 origin-top rounded-l-2xl bg-gradient-to-b from-indigo-600 to-indigo-400"
          />

          {/* Header */}

          <motion.h1
            variants={itemEnter}
            className="text-2xl font-semibold tracking-tight text-slate-900"
          >
            Sign in to
            <span className="block text-indigo-600"><strong className="text-indigo-600">IMX</strong> Engineering Resources</span>
          </motion.h1>

          <motion.p variants={itemEnter} className="mt-2 text-sm text-slate-600">
            Use Google or your email & password to continue.
          </motion.p>

          {/* OAuth button */}
          <motion.div variants={itemEnter} className="mt-6">
            <button
              type="button"
              onClick={signInGoogle}
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
              Continue with Google
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemEnter} className="my-6 flex items-center gap-3 text-xs text-slate-500">
            <div className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </motion.div>

          {/* Email form */}
          <motion.form variants={itemEnter} onSubmit={signInEmail} className="space-y-4">
            <fieldset disabled={loading} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    aria-invalid={email.length > 0 && !emailIsValid}
                    aria-describedby="email-help"
                  />
                </div>
                <p id="email-help" className="mt-1 text-[11px] text-slate-500">
                  Use your corporate email if possible.
                </p>
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-medium text-slate-700">
                  Password
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="rounded-md p-1 text-slate-600 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                    Remember me
                  </label>
                  <a href="/reset" className="text-xs font-medium text-indigo-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>

              {err && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-black/5 transition active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </fieldset>
          </motion.form>

          <motion.p variants={itemEnter} className="mt-6 text-center text-xs text-slate-500">
            By continuing, you agree to our <a className="underline underline-offset-2 hover:no-underline" href="/legal/terms">Terms</a> &{" "}
            <a className="underline underline-offset-2 hover:no-underline" href="/legal/privacy">Privacy</a>.
          </motion.p>
        </motion.div>
      </section>
    </main>
  );
}
