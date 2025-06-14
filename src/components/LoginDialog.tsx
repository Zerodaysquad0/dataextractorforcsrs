
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSuccessMsg(null);
    try {
      if (tab === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setSuccessMsg("Check your inbox to verify your email!");
      }
      onClose();
    } catch (e: any) {
      setErr(e.message || "Error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tab === "login" ? "Sign In" : "Sign Up"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button className="w-full" variant="outline" onClick={signInWithGoogle} disabled={loading}>
            Continue with Google
          </Button>
          <div className="relative w-full text-center text-xs">
            <span className="bg-white px-2 text-slate-400">OR</span>
            <span aria-hidden className="absolute left-0 right-0 top-1/2 border-t border-slate-200" />
          </div>
          <form onSubmit={handleEmailAction} className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              required
              value={email}
              disabled={loading}
              autoComplete="email"
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              required
              value={password}
              disabled={loading}
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
              onChange={e => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {tab === "login" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          {err && <div className="text-destructive text-center text-sm">{err}</div>}
          {successMsg && <div className="text-green-700 text-center text-sm">{successMsg}</div>}
        </div>
        <DialogFooter>
          <div className="w-full text-center text-xs">
            {tab === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => setTab("signup")} className="text-blue-600 underline" disabled={loading}>
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setTab("login")} className="text-blue-600 underline" disabled={loading}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
