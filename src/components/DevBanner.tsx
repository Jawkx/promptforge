import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DevBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 flex items-center justify-between absolute">
      <div className="flex items-center gap-2">
        <span className="font-medium">DEV</span>
        <span className="text-sm">Development Mode</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(false)}
        className="h-6 w-6 p-0 hover:bg-yellow-500/20"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

