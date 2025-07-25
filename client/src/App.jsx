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
import DashboardFriend from './pages/Dashboard/DashboardFriend';
import FriendDetails from './pages/FriendDetails/FriendDetails';
import NewScore from './pages/FriendDetails/NewScore';
import Developer from './pages/Developer';

function App()
{
  return (
    <Router>
    <AuthProvider>
    <MessageProvider> 
        <div className="min-h-screen flex flex-col">
          <div className="app-background fixed inset-0 -z-10" />
          <WelcomeMessage />
          <Navbar />
          <main className="flex-grow mt-8 px-1">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/login" element={<PublicRoute><div dir="rtl"><Login /></div></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><div dir="rtl"><Register /></div></PublicRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/add-friend" element={<ProtectedRoute><AddFriend /></ProtectedRoute>} /> 
              <Route path="/Dashboard-Friend" element={<ProtectedRoute><DashboardFriend/></ProtectedRoute>} />
              <Route path="/friend-details/:id" element={<ProtectedRoute><FriendDetails/></ProtectedRoute>} />
              <Route path="/matchscore/:id" element={<ProtectedRoute><NewScore/></ProtectedRoute>} />
              <Route path="/Developer" element={<ProtectedRoute><Developer/></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
         <Footer/>
        </div>
        </MessageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;