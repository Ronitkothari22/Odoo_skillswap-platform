import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { authService } from '../services/authService';

function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth callback started');
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        console.log('Code from URL:', code ? 'Present (length: ' + code.length + ')' : 'Missing');
        console.log('Error from URL:', error);
        
        // More detailed logging
        console.log('Full URL search params:', location.search);

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        // Exchange the code for session tokens
        console.log('Calling handleOAuthCallback with code');
        const response = await authService.handleOAuthCallback(code);
        console.log('OAuth callback response:', response);

        if (response.success) {
          // Store user profile information
          if (response.user) {
            const userData = {
              id: response.user.id,
              email: response.user.email,
              name: response.user.user_metadata?.name,
              avatar_url: response.user.user_metadata?.avatar_url,
              authType: 'google'
            };
            console.log('Storing user data:', userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Make sure tokens are stored
            console.log('Access token present:', !!localStorage.getItem('access_token'));
          }

          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(response.message || 'Authentication failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('Network error occurred during authentication');
      }
    };

    handleOAuthCallback();
  }, [location, navigate]);

  const handleRetry = () => {
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-indigo-200 rounded-3xl bg-white shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <div className="mb-6">
                {status === 'loading' && (
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                )}
                
                {status === 'success' && (
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-100 p-2">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-red-100 p-2">
                      <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {status === 'loading' && 'Authenticating...'}
                {status === 'success' && 'Authentication Successful!'}
                {status === 'error' && 'Authentication Failed'}
              </h2>
              
              <p className="text-gray-600 mb-6">{message}</p>

              {status === 'error' && (
                <button
                  onClick={handleRetry}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              )}

              {status === 'success' && (
                <div className="text-sm text-gray-500">
                  Redirecting to dashboard...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OAuthCallback; 
