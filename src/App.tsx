import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "./components/ui/sonner";
import Editor from "./screens/Editor";
import AddContext from "./screens/AddContext";
import EditContext from "./screens/EditContext";

function App() {

  return (
    <>
      <Switch>
        <Route path="/" component={Editor} />
        <Route path="/add" component={AddContext} />
        <Route path="/edit/:type/:id" component={EditContext} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
