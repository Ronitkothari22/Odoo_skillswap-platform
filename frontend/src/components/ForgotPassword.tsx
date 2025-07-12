import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleHome = () => {
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleResetPassword = () => {
    // Here you would typically send a password reset email
    console.log('Password reset requested for:', email);
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border-2 border-indigo-200 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Skill Swap Platform</h1>
          <Button 
            onClick={handleHome}
            variant="outline"
            className="border-2 border-indigo-300 rounded-full px-6 py-2 font-semibold text-sm hover:bg-indigo-50 text-indigo-700"
          >
            Home
          </Button>
        </div>

        {/* Forgot Password Form */}
        <Card className="border-2 border-indigo-200 rounded-3xl bg-white shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600">Enter your email to receive a password reset link</p>
            </div>

            {!resetSent ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="border-2 border-gray-300 rounded-xl h-12 text-base focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={handleResetPassword}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border-0 rounded-full px-12 py-3 font-semibold text-base shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Reset Password
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6">
                  <p className="font-medium">Reset link sent!</p>
                  <p className="text-sm mt-1">Please check your email for instructions to reset your password.</p>
                </div>
                <Button 
                  onClick={handleSignIn}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border-0 rounded-full px-12 py-3 font-semibold text-base shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Back to Sign In
                </Button>
              </div>
            )}

            <div className="text-center border-t border-gray-200 pt-6">
              <p className="text-gray-600 text-sm mb-3">Remember your password?</p>
              <Button 
                onClick={handleSignIn}
                variant="outline"
                className="border-2 border-indigo-300 rounded-xl px-6 py-2 font-semibold text-sm hover:bg-indigo-50 text-indigo-700"
              >
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;