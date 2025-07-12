import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Marc Demo',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 3.4,
    skillsOffered: ['Skill offered 1', 'Next JS'],
    skillsWanted: ['Skill wanted 1', 'Photography'],
    availability: 'Available'
  },
  {
    id: '2',
    name: 'Mitchell',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 2.5,
    skillsOffered: ['Skill offered 1', 'Next JS'],
    skillsWanted: ['Skill wanted 1', 'Photography'],
    availability: 'Busy'
  },
  {
    id: '3',
    name: 'Joe wills',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rating: 4.0,
    skillsOffered: ['Skill offered 1', 'Next JS'],
    skillsWanted: ['Skill wanted 1', 'Photography'],
    availability: 'Available'
  }
];

function SkillSwapPlatform() {
  const navigate = useNavigate();
  const [users] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         user.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAvailability = availabilityFilter === 'all' || 
                               user.availability.toLowerCase() === availabilityFilter.toLowerCase();

    return matchesSearch && matchesAvailability;
  });

  const handleRequest = (userId: string, userName: string) => {
    alert(`Swap request sent to ${userName}!`);
  };

  const handleSearch = () => {
    console.log('Search triggered for:', searchTerm);
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-gray-300 shadow-sm">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Skill Swap Platform</h1>
          <Button 
            onClick={handleSignIn}
            className="bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-600 rounded-xl px-4 sm:px-6 py-2 font-semibold text-sm"
          >
            Sign In
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-full sm:w-48 lg:w-56">
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="bg-white border-2 border-gray-300 rounded-xl h-11 sm:h-12">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <Input
              placeholder="Search users, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-2 border-gray-300 rounded-xl h-11 sm:h-12 flex-1"
            />
            <Button 
              variant="outline" 
              size="default"
              className="border-2 border-gray-300 rounded-xl h-11 sm:h-12 px-4 sm:px-6 w-full sm:w-auto"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="sm:inline">Search</span>
            </Button>
          </div>
        </div>

        {/* User Cards */}
        <div className="space-y-3 sm:space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="border-2 border-gray-900 rounded-2xl sm:rounded-3xl bg-white shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6">
                  {/* Profile Photo */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-center gap-4 lg:gap-0 w-full lg:w-auto">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 border-2 border-gray-900 flex-shrink-0 lg:mb-2">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-base sm:text-lg font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="lg:text-center">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 lg:hidden">{user.name}</h3>
                      <div className="text-xs text-gray-600 font-medium hidden lg:block">Profile Photo</div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 w-full lg:w-auto">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 hidden lg:block">{user.name}</h3>
                    
                    {/* Skills Offered */}
                    <div className="mb-3">
                      <span className="text-xs sm:text-sm text-green-600 font-semibold mr-2 sm:mr-3 block sm:inline">Skill offered:</span>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-0 sm:inline-flex">
                        {user.skillsOffered.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs border-gray-900 text-gray-900 rounded-full px-2 sm:px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Skills Wanted */}
                    <div className="mb-4 lg:mb-0">
                      <span className="text-xs sm:text-sm text-blue-600 font-semibold mr-2 sm:mr-3 block sm:inline">Skill wanted:</span>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-0 sm:inline-flex">
                        {user.skillsWanted.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs border-gray-900 text-gray-900 rounded-full px-2 sm:px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Request Button and Rating */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 w-full lg:w-auto">
                    <div className="flex lg:order-2 lg:text-right">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-700 mb-0 lg:mb-1">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">rating</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-gray-900 ml-2 lg:ml-0 lg:block">
                        {user.rating.toFixed(1)}/5
                      </div>
                    </div>
                    <Button 
                      className="bg-cyan-200 text-cyan-800 hover:bg-cyan-300 border-2 border-cyan-400 rounded-xl px-4 sm:px-6 py-2 font-semibold text-sm lg:order-1 flex-shrink-0"
                      onClick={() => handleRequest(user.id, user.name)}
                    >
                      Request
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-base sm:text-lg">No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillSwapPlatform;
