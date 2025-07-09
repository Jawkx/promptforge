import { Toaster } from "./components/ui/sonner";
import Editor from "./screens/Editor/index";

function App() {
  return (
    <>
      <div className="h-screen w-screen flex flex-col">
        <Editor />
      </div>
      <Toaster />
    </>
  );
}

export default App;
