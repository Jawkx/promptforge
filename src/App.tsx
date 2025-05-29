import PromptEditor from "./components/PromptEditor";
import { Toaster } from "./components/ui/toaster";

function App() {

  return (
    <>
      <div className="min-h-screen">
        <PromptEditor />
      </div>
      <Toaster />
    </>
  );
}

export default App;
