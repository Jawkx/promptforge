import { SignIn } from "@clerk/clerk-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Auth = ({ isOpen, onOpenChange }: AuthProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[25rem] p-0 border-none">
        <SignIn routing="hash" signUpUrl="/sign-up" />
      </DialogContent>
    </Dialog>
  );
};
