import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import logoSrc from "@assets/project_handball_logo_1778253221361.png";

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="h-11 pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function Signup() {
  const { register } = useAuth();
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!dateOfBirth) {
      setError("Date of birth is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone || undefined, dateOfBirth);
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-primary">Create account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Join the Project Handball community</p>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>

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
              <Label htmlFor="dob" className="text-sm font-semibold">
                Date of Birth
                <span className="ml-1.5 text-[10px] font-normal text-muted-foreground normal-case tracking-normal">
                  Used to streamline clinic &amp; tournament sign-ups
                </span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                required
                className="h-11"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold">
                Phone
                <span className="ml-1.5 text-[10px] font-normal text-muted-foreground normal-case tracking-normal">Optional</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password" className="text-sm font-semibold">Confirm Password</Label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-0.5">Passwords do not match</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || (!!confirmPassword && password !== confirmPassword)}
              className="h-11 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-widest rounded-xl mt-1"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-accent font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
