import { SignIn } from "@clerk/clerk-react";
import { useQuery } from "@livestore/react";
import { preference$ } from "@/livestore/user-store/queries";
import { useLiveStores } from "@/store/LiveStoreProvider";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Auth({ isOpen, onOpenChange }: AuthProps) {
  const { userStore } = useLiveStores();
  const preference = useQuery(preference$, { store: userStore });
  const theme = preference.theme ?? "dark";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 border-0">
        <SignIn routing="hash" signUpUrl="/sign-up" />
      </DialogContent>
    </Dialog>
  );
}
