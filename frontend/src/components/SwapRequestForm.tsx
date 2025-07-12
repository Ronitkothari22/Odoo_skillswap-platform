import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { swapService } from '@/services/swapService';
import { config } from '@/config/config';

interface User {
  id: string;
  name: string;
  avatar_url?: string;
  location?: string;
  skills: Array<{
    id: string;
    name: string;
    proficiency: number;
  }>;
  desiredSkills: Array<{
    id: string;
    name: string;
    priority: number;
  }>;
  availability: Array<{
    id: string;
    weekday: number;
    start_time: string;
    end_time: string;
  }>;
  rating_avg: number;
}

interface CurrentUserProfile {
  id: string;
  name: string;
  skills: Array<{
    id: string;
    name: string;
    proficiency: number;
  }>;
  desiredSkills: Array<{
    id: string;
    name: string;
    priority: number;
  }>;
}

function SwapRequestForm() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(null);
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState('');
  const [selectedWantedSkill, setSelectedWantedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
        const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading data for userId:', userId);
      console.log('API Base URL:', config.API_BASE_URL);

      // Load current user profile and target user profile
      const [currentUserResponse, targetUserResponse] = await Promise.all([
        fetch(`${config.API_BASE_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }),
        fetch(`${config.API_BASE_URL}/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
      ]);

      console.log('Current user response status:', currentUserResponse.status);
      console.log('Target user response status:', targetUserResponse.status);

      if (!currentUserResponse.ok) {
        console.error('Current user response error:', currentUserResponse.status, currentUserResponse.statusText);
        const errorText = await currentUserResponse.text();
        console.error('Current user error body:', errorText);
        throw new Error(`Failed to load current user: ${currentUserResponse.status}`);
      }

      if (!targetUserResponse.ok) {
        console.error('Target user response error:', targetUserResponse.status, targetUserResponse.statusText);
        const errorText = await targetUserResponse.text();
        console.error('Target user error body:', errorText);
        throw new Error(`Failed to load target user: ${targetUserResponse.status}`);
      }

      const currentUserData = await currentUserResponse.json();
      const targetUserData = await targetUserResponse.json();

      console.log('Current user data:', currentUserData);
      console.log('Target user data:', targetUserData);

      setCurrentUser(currentUserData.profile);
      setUser(targetUserData.user);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Failed to load user data. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

    if (userId) {
      loadData();
    }
  }, [userId]);

  const handleHome = () => {
    navigate('/dashboard');
  };

  const handleSwapRequest = () => {
    navigate('/dashboard');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSubmit = async () => {
    console.log('=== SWAP REQUEST DEBUG ===');
    console.log('selectedOfferedSkill:', selectedOfferedSkill);
    console.log('selectedWantedSkill:', selectedWantedSkill);
    console.log('currentUser.skills:', currentUser?.skills);
    console.log('user.skills:', user?.skills);
    console.log('user.desiredSkills:', user?.desiredSkills);
    
    if (!selectedOfferedSkill) {
      setError('Please select a skill you are offering');
      return;
    }
    
    if (!selectedWantedSkill) {
      setError('Please select a skill you want');
      return;
    }

    if (!user || !currentUser) {
      setError('User data not loaded');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const swapRequestData = {
        responder_id: user.id,
        give_skill_id: selectedOfferedSkill,
        take_skill_id: selectedWantedSkill,
        message: message || undefined
      };

      console.log('Sending swap request:', swapRequestData);
      const response = await swapService.createSwapRequest(swapRequestData);

      if (response.success) {
        alert(`Swap request sent to ${user.name} successfully!`);
        navigate('/dashboard');
      } else {
        setError('Failed to send swap request. Please try again.');
      }
    } catch (error) {
      console.error('Error creating swap request:', error);
      setError('Failed to send swap request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailabilityText = (availability: User['availability']) => {
    if (!availability || availability.length === 0) return 'No availability set';
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const schedules = availability.map(slot => 
      `${weekdays[slot.weekday]} ${slot.start_time}-${slot.end_time}`
    );
    
    return schedules.join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">User not found</p>
          <Button onClick={handleHome} className="bg-blue-600 hover:bg-blue-700 text-white">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Find skills that the current user can offer to the target user
  const offeredSkillsFiltered = currentUser.skills.filter(skill => 
    user.desiredSkills.some(desired => desired.name.toLowerCase() === skill.name.toLowerCase())
  );

  // Find skills that the target user can offer to the current user
  const wantedSkillsFiltered = user.skills.filter(skill => 
    currentUser.desiredSkills.some(desired => desired.name.toLowerCase() === skill.name.toLowerCase())
  );

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
                variant="outline"
                className="text-gray-700 hover:bg-gray-100"
              >
                Swap Requests
              </Button>
              <Button 
                onClick={handleHome}
                variant="outline"
                className="text-gray-700 hover:bg-gray-100"
              >
                Home
              </Button>
              <Avatar 
                className="h-10 w-10 cursor-pointer" 
                onClick={handleProfile}
              >
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
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
                
                {user.location && (
                  <p className="text-gray-600 mt-2">{user.location}</p>
                )}
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <Badge 
                        key={skill.id} 
                        className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm"
                      >
                        {skill.name} ({skill.proficiency}/5)
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Wanted</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.desiredSkills.map((skill) => (
                      <Badge 
                        key={skill.id} 
                        className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                      >
                        {skill.name} (Priority: {skill.priority}/5)
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-600">
                    <strong>Availability:</strong> {getAvailabilityText(user.availability)}
                  </p>
                  <p className="text-gray-600">
                    <strong>Rating:</strong> {user.rating_avg.toFixed(1)}/5
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Swap Request Form */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Swap Request</h2>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {offeredSkillsFiltered.length === 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-700">
                      You don't have any skills that {user.name} is looking for. You can still send a request with your available skills.
                    </p>
                  </div>
                )}

                {user.skills.length === 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">
                      ⚠️ {user.name} hasn't added any skills to their profile yet. You cannot create a swap request with them until they add skills they can teach.
                    </p>
                  </div>
                )}

                {user.skills.length > 0 && wantedSkillsFiltered.length === 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-700">
                      {user.name} doesn't have any skills that you're looking for. You can still request any of their available skills.
                    </p>
                  </div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose one of your skills to offer
                    </label>
                    <Select 
                      value={selectedOfferedSkill} 
                      onValueChange={setSelectedOfferedSkill}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-300 rounded-md h-12">
                        <SelectValue placeholder="Select a skill to offer" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentUser.skills.map((skill) => (
                          <SelectItem key={skill.id} value={skill.id}>
                            {skill.name} (Your proficiency: {skill.proficiency}/5)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose one of their skills you want
                    </label>
                    <Select 
                      value={selectedWantedSkill} 
                      onValueChange={setSelectedWantedSkill}
                    >
                      <SelectTrigger className="w-full border-2 border-gray-300 rounded-md h-12">
                        <SelectValue placeholder="Select a skill you want" />
                      </SelectTrigger>
                      <SelectContent>
                        {user.skills.map((skill) => (
                          <SelectItem key={skill.id} value={skill.id}>
                            {skill.name} (Their proficiency: {skill.proficiency}/5)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write a message to introduce yourself and explain what you'd like to learn/teach..."
                      className="w-full border-2 border-gray-300 rounded-md min-h-[120px]"
                    />
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      variant="outline"
                      className="px-8 py-3"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitting || user.skills.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Sending...' : user.skills.length === 0 ? 'Cannot Send - No Skills Available' : 'Send Request'}
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