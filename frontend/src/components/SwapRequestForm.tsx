import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import swapService from '../services/swapService';

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

        // Load target user profile and current user profile
        const [targetUserResponse, currentUserResponse] = await Promise.all([
          fetch(`/api/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch('/api/profile', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        if (!targetUserResponse.ok || !currentUserResponse.ok) {
          throw new Error('Failed to load user data');
        }

        const targetUserData = await targetUserResponse.json();
        const currentUserData = await currentUserResponse.json();

        setUser(targetUserData.data);
        setCurrentUser(currentUserData.data);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load user data. Please try again.');
        // Fallback to mock data for development
        const mockUser: User = {
          id: userId || '1',
          name: 'Marc Demo',
          avatar_url: '',
          location: 'San Francisco, CA',
          skills: [
            { id: '1', name: 'Web Design', proficiency: 4 },
            { id: '2', name: 'UI/UX', proficiency: 5 },
            { id: '3', name: 'JavaScript', proficiency: 3 }
          ],
          desiredSkills: [
            { id: '4', name: 'Marketing', priority: 5 },
            { id: '5', name: 'SEO', priority: 4 },
            { id: '6', name: 'Content Writing', priority: 3 }
          ],
          availability: [
            { id: '1', weekday: 6, start_time: '09:00', end_time: '17:00' },
            { id: '2', weekday: 0, start_time: '10:00', end_time: '16:00' }
          ],
          rating_avg: 4.5
        };

        const mockCurrentUser: CurrentUserProfile = {
          id: 'current-user-id',
          name: 'Current User',
          skills: [
            { id: '7', name: 'JavaScript', proficiency: 5 },
            { id: '8', name: 'React', proficiency: 4 },
            { id: '9', name: 'Node.js', proficiency: 4 },
            { id: '10', name: 'UI Design', proficiency: 3 },
            { id: '11', name: 'Python', proficiency: 3 }
          ],
          desiredSkills: [
            { id: '12', name: 'Web Design', priority: 4 },
            { id: '13', name: 'UI/UX', priority: 5 }
          ]
        };

        setUser(mockUser);
        setCurrentUser(mockCurrentUser);
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

                {wantedSkillsFiltered.length === 0 && (
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
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                    >
                      {submitting ? 'Sending...' : 'Send Request'}
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