import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SilkProvider } from './contexts/SilkContext';
import AuthWrapper from './components/AuthWrapper';
import WebView from './pages/WebView';
import SilkAssistant from './pages/SilkAssistant';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ContactDetail from './pages/ContactDetail';
import AddContact from './pages/AddContact';
import EditContact from './pages/EditContact';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const [isOnboarded, setIsOnboarded] = React.useState(false);

  React.useEffect(() => {
    // Always start with onboarding screen - clear any existing data
    sessionStorage.clear();
    setIsOnboarded(false);
  }, []);

  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
  };

  const handleLogout = () => {
    // Clear session data and return to onboarding
    sessionStorage.clear();
    setIsOnboarded(false);
  };

  if (!isOnboarded) {
    return (
      <div className="App">
        <AuthWrapper onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ConnectionProvider>
        <SilkProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<WebView />} />
                <Route path="/assistant" element={<SilkAssistant />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/contact/:id" element={<ContactDetail />} />
                <Route path="/add-contact" element={<AddContact />} />
                <Route path="/edit-contact/:id" element={<EditContact />} />
              </Routes>
              <Navigation />
            </div>
          </Router>
        </SilkProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}

export default App;