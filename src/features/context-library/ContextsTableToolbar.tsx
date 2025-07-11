import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucideSearch, LucideTag } from "lucide-react";
import { useLocation } from "wouter";

interface ContextsTableToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ContextsTableToolbar: React.FC<ContextsTableToolbarProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const [, navigate] = useLocation();

  return (
    <div className="flex items-center mb-3 gap-2">
      <div className="relative flex-1">
        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter contexts by title or content..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-9 w-full pl-10"
        />
      </div>
      <Button variant="outline" onClick={() => navigate("/labels")}>
        <LucideTag className="h-4 w-4" />
      </Button>
    </div>
  );
};