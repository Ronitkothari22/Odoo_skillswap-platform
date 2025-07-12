import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // TODO: Update this import path if the Textarea component exists elsewhere, or replace with a standard textarea element if not available.
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  avatar: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  rating?: number;
}

function SwapRequestForm() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState('');
  const [selectedWantedSkill, setSelectedWantedSkill] = useState('');
  const [message, setMessage] = useState('');

  // Mock user data (your skills)
  const mySkills = ['JavaScript', 'React', 'Node.js', 'UI Design', 'Python'];

  useState(() => {
    // Simulate loading user data
    setTimeout(() => {
      const mockUser: User = {
        id: userId || '1',
        name: 'Marc Demo',
        avatar: '',
        skillsOffered: ['Web Design', 'UI/UX', 'JavaScript'],
        skillsWanted: ['Marketing', 'SEO', 'Content Writing'],
        availability: 'Weekends',
        rating: 4.5
      };
      setUser(mockUser);
      setLoading(false);
    }, 500);
  });

  const handleHome = () => {
    navigate('/dashboard');
  };

  const handleSwapRequest = () => {
    navigate('/dashboard');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSubmit = () => {
    if (!selectedOfferedSkill) {
      alert('Please select a skill you are offering');
      return;
    }
    
    if (!selectedWantedSkill) {
      alert('Please select a skill you want');
      return;
    }

    // In a real app, you would send this data to your backend
    alert(`Swap request sent to ${user?.name}!\nYou offered: ${selectedOfferedSkill}\nYou requested: ${selectedWantedSkill}`);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Skill Swap Platform</h1>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleSwapRequest}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-md px-4 py-2"
              >
                Swap request
              </Button>
              <Button 
                onClick={handleHome}
                className="bg-transparent text-gray-700 hover:bg-gray-100 rounded-md px-4 py-2"
              >
                Home
              </Button>
              <Avatar 
                className="h-10 w-10 cursor-pointer" 
                onClick={handleProfile}
              >
                <AvatarFallback className="bg-blue-100 text-blue-600">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* User Card */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <Avatar className="h-16 w-16 bg-blue-100 text-blue-600 border-2 border-blue-200">
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.map((skill, index) => (
                      <Badge 
                        key={index} 
                        className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Wanted</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.map((skill, index) => (
                      <Badge 
                        key={index} 
                        className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-600">Availability: {user.availability}</p>
                  <p className="text-gray-600">Rating: {user.rating?.toFixed(1)}/5</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Swap Request Form */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Swap Request</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose one of your offered skills
                    </label>
                    <Select 
                      value={selectedOfferedSkill} 
                      onValueChange={setSelectedOfferedSkill}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-300 rounded-md h-12">
                        <SelectValue placeholder="Select a skill to offer" />
                      </SelectTrigger>
                      <SelectContent>
                        {mySkills.map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose one of their wanted skills
                    </label>
                    <Select 
                      value={selectedWantedSkill} 
                      onValueChange={setSelectedWantedSkill}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-300 rounded-md h-12">
                        <SelectValue placeholder="Select a skill you want" />
                      </SelectTrigger>
                      <SelectContent>
                        {user.skillsWanted.map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write a message to introduce yourself and explain what you'd like to learn/teach..."
                      className="w-full border-2 border-gray-300 rounded-md min-h-[120px]"
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleSubmit}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 py-3 font-medium"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwapRequestForm;