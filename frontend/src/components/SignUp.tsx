import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '../services/authService';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error and success when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.signup(
        formData.email,
        formData.password,
        formData.name
      );

      if (response.success) {
        if (response.emailConfirmationRequired) {
          setSuccess('Account created successfully! Please check your email to verify your account.');
          // Don't navigate immediately if email confirmation is required
        } else {
          // Store user profile information
          if (response.user) {
            localStorage.setItem('user', JSON.stringify({
              id: response.user.id,
              email: response.user.email,
              name: response.user.user_metadata?.name || formData.name,
              avatar_url: response.user.user_metadata?.avatar_url,
              authType: 'regular',
              profile: response.profile
            }));
          }
          
          setSuccess('Account created successfully! You are now logged in.');
          // Navigate to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      } else {
        setError(response.message || 'Account creation failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with logo */}
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Skill Swap Platform
          </h1>
          <Button 
            onClick={handleHome}
            className="bg-white hover:bg-gray-50 text-blue-600 rounded-full px-4 py-1 text-sm font-medium border border-blue-100 shadow-sm transition-all duration-200"
          >
            Home
          </Button>
        </div>
        
        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Our Community</h2>
              <p className="text-gray-500">Create your account and start swapping skills</p>
            </div>
            
            {/* Name input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            
            {/* Email input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            
            {/* Password input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a password (min. 6 characters)"
                className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            
            {/* Confirm Password input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
              />
            </div>
            
            {/* Create Account button */}
            <Button 
              onClick={handleSignUp}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {success}
              </div>
            )}
          </div>
          
          {/* Sign in section */}
          <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <Button 
              onClick={handleSignIn}
              variant="outline"
              disabled={isLoading}
              className="bg-white hover:bg-gray-50 text-blue-600 font-medium py-2 px-6 rounded-xl border border-blue-200 shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
