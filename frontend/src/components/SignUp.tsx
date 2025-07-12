import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    console.log('Sign up data:', formData);
    alert('Account created successfully!');
    navigate('/dashboard');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/signin');
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

        {/* Sign Up Form */}
        <Card className="border-2 border-indigo-200 rounded-3xl bg-white shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Our Community</h2>
              <p className="text-gray-600">Create your account and start swapping skills</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="border-2 border-gray-300 rounded-xl h-12 px-4 py-2 text-base focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="border-2 border-gray-300 rounded-xl h-12 px-4 py-2 text-base focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a password"
                className="border-2 border-gray-300 rounded-xl h-12 px-4 py-2 text-base focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className="border-2 border-gray-300 rounded-xl h-12 px-4 py-2 text-base focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                onClick={handleSignUp}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border-0 rounded-full px-12 py-3 font-semibold text-base shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Create Account
              </Button>
            </div>

            <div className="text-center border-t border-gray-200 pt-6">
              <p className="text-gray-600 text-sm mb-3">Already have an account?</p>
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

export default SignUp;
