import { Toaster } from "./components/ui/sonner";
import Editor from "./screens/Editor/index";
import SignInScreen from "./screens/SignIn/index";
import DevBanner from "./components/DevBanner";
import { Route, Switch } from "wouter";

function App() {
  return (
    <>
      <DevBanner />
      <Switch>
        <Route path="/sign-in" component={SignInScreen} />
        <Route path="/" component={Editor} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
