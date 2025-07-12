import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code found');
        }

        // Exchange code for session
        const response = await fetch('http://localhost:8080/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (data.success) {
          // Store tokens
          localStorage.setItem('access_token', data.session.access_token);
          localStorage.setItem('refresh_token', data.session.refresh_token);
          
          // Redirect to dashboard or home
          navigate('/dashboard');
        } else {
          throw new Error(data.message || 'Authentication failed');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          🔐 Completing authentication...
        </div>
        <div>Please wait while we log you in.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'red' }}>
          ❌ Authentication Error
        </div>
        <div style={{ marginBottom: '1rem' }}>{error}</div>
        <button onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
        ✅ Authentication Successful!
      </div>
      <div>Redirecting to dashboard...</div>
    </div>
  );
}

export default AuthCallback; 