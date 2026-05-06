"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

interface SoftDeleteButtonProps {
  id: string;
  type: "product" | "store";
  name: string;
  onDelete?: () => void;
}

export function SoftDeleteButton({ id, type, name, onDelete }: SoftDeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${type}s/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletedAt: new Date().toISOString() }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      setShowConfirm(false);
      onDelete?.();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => setShowConfirm(true)}
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Delete
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
      <AlertTriangle className="w-4 h-4 text-red-600" />
      <p className="text-sm text-red-800 flex-1">
        Delete <strong>{name}</strong>?
      </p>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-200"
        onClick={() => setShowConfirm(false)}
      >
        Cancel
      </Button>
      <Button
        size="sm"
        className="bg-red-600 hover:bg-red-700 text-white"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Confirm"}
      </Button>
    </div>
  );
}
