import { Toaster } from "./components/ui/sonner";
import Editor from "./screens/Editor/index";
import DevBanner from "./components/DevBanner";

function App() {
  return (
    <>
      <DevBanner />
      <Editor />
      <Toaster />
    </>
  );
}

export default App;
