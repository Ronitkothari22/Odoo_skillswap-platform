import { Routes, Route } from 'react-router-dom';
import SkillSwapPlatform from './components/SkillSwapPlatform';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import UserProfile from './components/UserProfile';
import Dashboard from './components/Dashboard';
import UserDetail from './components/UserDetail';
import SwapRequestForm from './components/SwapRequestForm';
import SwapRequestManager from './components/SwapRequestManager';
import FeedbackManager from './components/FeedbackManager';
import OAuthCallback from './components/OAuthCallback';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SkillSwapPlatform />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/user/:userId" element={<UserDetail />} />
      <Route path="/swap-request/:userId" element={<SwapRequestForm />} />
      <Route path="/swap-requests" element={<SwapRequestManager />} />
      <Route path="/feedback" element={<FeedbackManager />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
    </Routes>
  );
}

export default App;
