import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiUploadCloud } from 'react-icons/fi';
import UploadBox from './components/UploadBox';
import Dashboard from './components/Dashboard';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleUploadSuccess = (data) => {
    setDashboardData(data.metrics);
  };

  const handleReset = () => {
    setDashboardData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FiUploadCloud className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="ml-2 text-xl font-bold">InsightPro</span>
            </div>
            <div className="flex items-center">
              {dashboardData && (
                <button
                  onClick={handleReset}
                  className="btn btn-outline mr-4"
                >
                  Upload New Data
                </button>
              )}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!dashboardData ? (
          <UploadBox onUploadSuccess={handleUploadSuccess} />
        ) : (
          <Dashboard data={dashboardData} />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            InsightPro © {new Date().getFullYear()} - Business Analytics Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App; 