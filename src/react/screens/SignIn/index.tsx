import { SignIn } from "@clerk/clerk-react";

const SignInScreen = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Logo/Brand in top left */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center">
            <span className="text-background font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-lg">PromptForge</span>
        </div>
      </div>

      {/* Centered content */}
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-medium">Welcome to PromptForge</h1>
            <p className="text-muted-foreground text-base">
              Prompt management designed for AI enthusiasts and teams
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
