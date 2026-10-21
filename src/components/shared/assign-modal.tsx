"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { assignIncident } from "@/lib/api";

interface AssignModalProps {
  incidentKey: string;
  currentAssignee: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (msg: string) => void;
}

export function AssignModal({
  incidentKey,
  currentAssignee,
  open,
  onOpenChange,
  onSuccess,
}: AssignModalProps) {
  const [name, setName] = useState(currentAssignee || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Assignment cannot be empty");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await assignIncident(incidentKey, name.trim());
      onSuccess(res.message || "Incident assigned successfully");
    } catch (err: unknown) {
      const error = err as { message?: string; details?: string[] };
      const msg = error?.message || error?.details?.[0] || "Assignment failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-secondary" />
            Assign Incident
          </DialogTitle>
          <DialogDescription>
            Assign <span className="font-mono font-bold text-secondary">{incidentKey}</span> to a developer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            autoFocus
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            placeholder="Enter developer name..."
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
            className="h-10"
          />

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-error text-xs font-medium flex items-center gap-1.5"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
