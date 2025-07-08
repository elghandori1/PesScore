import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { MessageProvider } from './context/MessageContext';
import './style/App.css';

import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import WelcomeMessage from './components/WelcomeMessage';
import Profile from './pages/Profile';
import AddFriend from './pages/AddFriend';

function App() {

  return (
    <Router>
      <AuthProvider>
      <MessageProvider> 
        <div className="min-h-screen flex flex-col">
          <div className="app-background fixed inset-0 -z-10" />
          <WelcomeMessage />
          <Navbar />
          <main className="flex-grow mt-14 px-2 xs:px-3 sm:px-4 md:px-6">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/login" element={<PublicRoute><div dir="rtl"><Login /></div></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><div dir="rtl"><Register /></div></PublicRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/add-friend" element={<ProtectedRoute><AddFriend /></ProtectedRoute>} /> 
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        </MessageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;