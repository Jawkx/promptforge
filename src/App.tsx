import React from 'react';
import PromptEditor from './components/PromptEditor';

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

  return (
    <div className="min-h-screen bg-dark-900">
      <PromptEditor onCopy={handleCopy} />
    </div>
  );
}

export default App;