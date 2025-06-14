
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type EmailShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: string;
  topic?: string;
  images?: string[];
};

export function EmailShareDialog({
  open,
  onOpenChange,
  results,
  topic,
  images = [],
}: EmailShareDialogProps) {
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://pzrkqxfulzhuxymabdtq.supabase.co/functions/v1/send-results-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmtxeGZ1bHpodXh5bWFiZHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTI4MDEsImV4cCI6MjA2NTQ4ODgwMX0.PFYhObU0hajVtpmNCsOR0q15lxfwfocRiN2BdLLK7Xc`,
          },
          body: JSON.stringify({
            to,
            results,
            topic,
            images,
          }),
        }
      );
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Email sent!",
          description: `The results were sent to ${to}.`,
        });
        setTo("");
        onOpenChange(false);
      } else {
        throw new Error(data.error || "Failed to send email.");
      }
    } catch (e: any) {
      console.error("Email sending error:", e);
      toast({
        title: "Sending failed",
        description: e.message || "Failed to send the email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Results via Email</DialogTitle>
          <DialogDescription>
            Enter a recipient's email address to share the extracted results.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Recipient email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            autoFocus
            required
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading || !to}>
            {loading ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
