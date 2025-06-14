
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Chrome } from "lucide-react";

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
    
    if (!email || !password) {
      setErr("Please fill in all fields");
      return;
    }

    try {
      if (tab === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setSuccessMsg("Check your inbox to verify your email!");
      }
      onClose();
    } catch (e: any) {
      setErr(e.message || "An error occurred");
    }
  };

  const handleGoogleSignIn = async () => {
    setErr(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setErr(e.message || "Google sign in failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {tab === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={handleGoogleSignIn} 
            disabled={loading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Continue with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>
          
          <form onSubmit={handleEmailAction} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  required
                  value={email}
                  disabled={loading}
                  autoComplete="email"
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  disabled={loading}
                  autoComplete={tab === "signup" ? "new-password" : "current-password"}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : (tab === "login" ? "Sign In" : "Create Account")}
            </Button>
          </form>
          
          {err && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-destructive text-sm text-center">{err}</p>
            </div>
          )}
          
          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-700 text-sm text-center">{successMsg}</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <div className="w-full text-center text-sm text-muted-foreground">
            {tab === "login" ? (
              <>
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setTab("signup")} 
                  className="text-primary underline underline-offset-4 hover:text-primary/80" 
                  disabled={loading}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setTab("login")} 
                  className="text-primary underline underline-offset-4 hover:text-primary/80" 
                  disabled={loading}
                >
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
