import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

function UserDetail() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        console.log("Loading user with ID:", userId);
        
        const response = await fetch(`${config.API_BASE_URL}/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load user: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log("User data loaded:", userData);
        setUser(userData.user);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
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

  const handleSendRequest = () => {
    navigate(`/swap-request/${userId}`);
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
      
      {/* User Detail Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              {/* User Info */}
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                  <Button 
                    onClick={handleSendRequest}
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-md px-6 py-2"
                  >
                    Request
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Skills Offered</h3>
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
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Skills Wanted</h3>
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
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Rating and Feedback</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${i < Math.floor(user.rating_avg || 0) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-lg font-medium text-gray-900">{user.rating_avg?.toFixed(1)}/5</span>
                    </div>
                    {user.location && (
                      <p className="text-gray-600 mt-2">Location: {user.location}</p>
                    )}
                    <p className="text-gray-600 mt-2">
                      Availability: {user.availability.length > 0 ? `${user.availability.length} slots available` : 'No availability set'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <Avatar className="h-40 w-40 bg-blue-100 text-blue-600 border-4 border-blue-200">
                  <AvatarFallback className="text-4xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;

