import { Toaster as Sonner } from "sonner";
import { useQuery } from "@livestore/react";
import { preferences$ } from "@/livestore/live-store/queries";
import { useLiveStore } from "@/store/LiveStoreProvider";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const liveStore = useLiveStore();
  const preferences = useQuery(preferences$, { store: liveStore });
  const theme = preferences?.[0]?.theme ?? "dark";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
