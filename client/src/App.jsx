import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import {  useState } from "react";
import './style/App.css';

import PublicRoute from './routes/PublicRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import ProtectedRoute from './routes/ProtectedRoute';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import WelcomeMessage from './components/WelcomeMessage';

function App() {

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <div className="app-background fixed inset-0 -z-10" />
          <WelcomeMessage />
          <Navbar />
          <main className="flex-grow mt-14 px-2 xs:px-3 sm:px-4 md:px-6">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/login" element={<PublicRoute><div dir="rtl"><Login /></div></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><div dir="rtl"><Register /></div></PublicRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;