import PromptEditor from "./components/PromptEditor";
import { Toaster } from "./components/ui/toaster";

function App() {

  return (
    <>
      <div className="h-screen w-screen flex justify-center">
        <PromptEditor />
      </div>
      <Toaster />
    </>
  );
}

export default App;
