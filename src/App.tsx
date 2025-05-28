import { LucideMoon, LucideSun } from 'lucide-react';
import PromptEditor from './components/PromptEditor';
import { Button } from './components/ui/button';
import { useTheme } from './hooks/useTheme';

function App() {
  const handleCopy = () => {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fadeInOut';
    notification.textContent = 'Copied to clipboard!';
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('opacity-0');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  };

  const { setTheme, theme } = useTheme()

  const handleToggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className='py-5 px-5'>
        <div className='flex flex-row justify-between mx-auto max-w-7xl'>
          <h1 className='text-2xl text-primary font-semibold'>Context Carve</h1>
          <Button variant="ghost" onClick={handleToggleTheme} > {theme === "light" ? <LucideSun className='text-foreground' strokeWidth={2} /> : <LucideMoon className='text-foreground' />}</Button>
        </div>
      </div>
      <PromptEditor onCopy={handleCopy} />
    </div>
  );
}

export default App;
