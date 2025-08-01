import { AppLogo } from "@/components/AppLogo";
import { SignIn } from "@clerk/clerk-react";

const SignInScreen = () => {

  return (
    <div className="min-h-screen bg-background">

      {/* Centered content */}
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-3">
            <AppLogo />
            <p className="text-muted-foreground text-base">
              Sign in to sync your contexts and labels.
            </p>
          </div>

          <div className="w-full">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/"
              withSignUp={false}
              appearance={{
                elements: {
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  footer: "hidden",
                  card: "shadow-none border-0 bg-transparent",
                  rootBox: "w-full",
                  formButtonPrimary: "w-full",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInScreen;
