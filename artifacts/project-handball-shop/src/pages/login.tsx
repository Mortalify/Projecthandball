import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, CheckCircle2 } from "lucide-react";
import logoSrc from "@assets/project_handball_logo_1778253221361.png";

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setForgotError("");
    if (!forgotEmail.trim()) { setForgotError("Please enter your email"); return; }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setForgotSent(true);
    } catch (err: any) {
      setForgotError(err.message ?? "Something went wrong");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotEmail("");
    setForgotSent(false);
    setForgotError("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <img src={logoSrc} alt="Project Handball" className="h-16 w-16 object-contain mb-4" />
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-primary">Welcome back</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign in to your Project Handball account</p>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                  className="text-xs text-accent hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-widest rounded-xl mt-1"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-accent font-bold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={e => { if (e.target === e.currentTarget) closeForgot(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border border-border shadow-xl p-8 w-full max-w-sm"
            >
              {forgotSent ? (
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-display font-black text-xl uppercase tracking-tight text-primary mb-1">Request Sent</h2>
                    <p className="text-sm text-muted-foreground">Your password reset request has been sent to the admin. You'll be contacted shortly.</p>
                  </div>
                  <Button onClick={closeForgot} className="w-full bg-accent hover:bg-accent/90 text-white font-bold">
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-display font-black text-lg uppercase tracking-tight text-primary">Forgot Password</h2>
                      <p className="text-xs text-muted-foreground">Enter your email to request a reset</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="forgot-email" className="text-sm font-semibold">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={e => { setForgotEmail(e.target.value); setForgotError(""); }}
                        onKeyDown={e => e.key === "Enter" && handleForgot()}
                        className="h-11"
                        autoFocus
                      />
                    </div>

                    {forgotError && (
                      <p className="text-sm text-red-500">{forgotError}</p>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={closeForgot}>
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold"
                        onClick={handleForgot}
                        disabled={forgotLoading || !forgotEmail.trim()}
                      >
                        {forgotLoading ? "Sending…" : "Send Request"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
