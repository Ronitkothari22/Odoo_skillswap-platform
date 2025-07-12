import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  avatar: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  
  // Mock data for users
  const users: User[] = [
    {
      id: '1',
      name: 'Maria Jensen',
      avatar: '',
      skillsOffered: ['Web Design', 'UI/UX'],
      skillsWanted: ['Marketing', 'SEO'],
      availability: 'Weekends'
    },
    {
      id: '2',
      name: 'Abdul',
      avatar: '',
      skillsOffered: ['Photography', 'Video Editing'],
      skillsWanted: ['Coding', 'Graphic Design'],
      availability: 'Evenings'
    },
    {
      id: '3',
      name: 'Jane Smith',
      avatar: '',
      skillsOffered: ['Cooking', 'Baking'],
      skillsWanted: ['Language', 'Music'],
      availability: 'Weekdays'
    }
  ];
  
  const handleProfile = () => {
    navigate('/profile');
  };
  
  const handleSwapRequest = () => {
    // Handle swap request logic
    console.log('Swap request clicked');
  };
  
  const handleRequestUser = (userId: string) => {
    console.log('Request swap with user:', userId);
    navigate(`/user/${userId}`);
  };

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
      
      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-48">
            <Select 
              value={availabilityFilter} 
              onValueChange={setAvailabilityFilter}
            >
              <SelectTrigger className="border border-gray-300 rounded-md h-10">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Weekdays">Weekdays</SelectItem>
                <SelectItem value="Weekends">Weekends</SelectItem>
                <SelectItem value="Evenings">Evenings</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search skills or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* User Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="space-y-4">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 bg-blue-100 text-blue-600">
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">Availability: {user.availability}</p>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.skillsOffered.map((skill, index) => (
                        <Badge 
                          key={index} 
                          className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {user.skillsWanted.map((skill, index) => (
                        <Badge 
                          key={index} 
                          className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleRequestUser(user.id)}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-md px-4 py-2"
                >
                  Request
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;



