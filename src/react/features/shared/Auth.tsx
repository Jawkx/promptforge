import { SignIn } from "@clerk/clerk-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AuthProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Auth = ({ isOpen, onOpenChange }: AuthProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[25rem] overflow-visible p-0 border-b-2">
        <SignIn
          routing="hash"
          withSignUp={false}
          appearance={{
            elements: {
              headerSubtitle: "hidden",
              footer: "hidden",
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
