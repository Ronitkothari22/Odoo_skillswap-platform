import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { authService } from '../services/authService';

interface User {
  id: string;
  name: string;
  avatar: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  authType: 'regular' | 'google';
  profile?: any;
}

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  
  // Check authentication and get user data
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/signin');
      return;
    }

    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/signin');
      }
    } else {
      navigate('/signin');
    }
  }, [navigate]);

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

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout by clearing localStorage
      localStorage.clear();
      navigate('/signin');
    }
  };

  // Generate user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading or redirect if user not loaded
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with glass effect */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Skill Swap Platform
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                Welcome, {currentUser.name}!
              </span>
              <Button 
                onClick={handleSwapRequest}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md"
              >
                Swap Request
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar 
                  className="h-10 w-10 cursor-pointer ring-2 ring-blue-200" 
                  onClick={handleProfile}
                >
                  <AvatarImage src={currentUser.avatar_url || undefined} alt={currentUser.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 bg-transparent hover:bg-gray-100 rounded-full p-2 text-sm transition-colors"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filter section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-48">
            <Select defaultValue="all">
              <SelectTrigger className="h-10 rounded-xl border-gray-300 bg-white shadow-sm">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="language">Language</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search skills or users..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-blue-100">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">
                      Availability: {user.availability}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {user.skillsOffered.map((skill: string, index: number) => (
                      <Badge 
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={() => handleRequestUser(user.id)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-full px-6 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md"
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



