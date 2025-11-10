import { useState } from 'react';
import XSS from './components/XSS';
import SensitiveDataExposure from './components/SensitiveDataExposure';

function App() {
  const [activeTab, setActiveTab] = useState('xss');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Drugi projekt
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Demonstracija sigurnosnih ranjivosti
          </p>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'xss'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('xss')}
            >
              Cross-Site Scripting (XSS)
            </button>
            <button
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'sensitive'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('sensitive')}
            >
              Sensitive Data Exposure
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'xss' && <XSS />}
        {activeTab === 'sensitive' && <SensitiveDataExposure />}
      </main>
    </div>
  );
}

export default App;
