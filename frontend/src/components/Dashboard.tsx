import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '../services/authService';
import discoveryService, { DiscoveryUser, MatchUser, PerfectMatch, PlatformStats } from '../services/discoveryService';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for discovery
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedTab, setSelectedTab] = useState('discover');
  const [discoveredUsers, setDiscoveredUsers] = useState<DiscoveryUser[]>([]);
  const [personalizedMatches, setPersonalizedMatches] = useState<MatchUser[]>([]);
  const [perfectMatches, setPerfectMatches] = useState<PerfectMatch[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  
  // Check authentication and get user data
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/signin');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
        loadInitialData();
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/signin');
      }
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [
        usersResponse,
        matchesResponse,
        perfectMatchesResponse,
        platformStatsData
      ] = await Promise.all([
        discoveryService.getAllUsers({ page: 1, limit: 10 }),
        discoveryService.getPersonalizedMatches({ page: 1, limit: 5, minCompatibility: 0.3 }),
        discoveryService.getPerfectMatches({ page: 1, limit: 3 }),
        discoveryService.getPlatformStats()
      ]);

      setDiscoveredUsers(usersResponse.data);
      setPersonalizedMatches(matchesResponse.data);
      setPerfectMatches(perfectMatchesResponse.data);
      setPlatformStats(platformStatsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await discoveryService.searchUsers({
        skills: searchTerm,
        location: locationFilter,
        page: 1,
        limit: 10
      });
      setDiscoveredUsers(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    if (value === 'discover' && discoveredUsers.length === 0) {
      loadInitialData();
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSwapRequest = () => {
    navigate('/swap-requests');
  };

  const handleUserProfile = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      navigate('/signin');
    }
  };

  const renderUserCard = (user: DiscoveryUser, compatibility?: any) => (
    <Card key={user.id} className="group bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 rounded-2xl overflow-hidden" onClick={() => handleUserProfile(user.id)}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16 ring-4 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-lg">
              {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">{user.name}</h3>
              {compatibility && (
                <Badge className={`${discoveryService.getCompatibilityColor(compatibility.overall_score)} border-0`}>
                  {Math.round(compatibility.overall_score * 100)}% match
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{user.location}</p>
            
            {/* Skills */}
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered</h4>
              <div className="flex flex-wrap gap-1">
                {(user.skills || []).slice(0, 4).map((skill, index) => (
                  <Badge key={index} className={`${discoveryService.getProficiencyColor(skill.proficiency)} border-0 text-xs transition-all duration-200 hover:scale-105`}>
                    {skill.name} ({skill.proficiency})
                  </Badge>
                ))}
                {(user.skills || []).length > 4 && (
                  <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                    +{(user.skills || []).length - 4} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Desired Skills */}
            {user.desired_skills && user.desired_skills.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Looking to Learn</h4>
                <div className="flex flex-wrap gap-1">
                  {(user.desired_skills || []).slice(0, 3).map((skill, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 border-0 text-xs transition-all duration-200 hover:scale-105">
                      {skill.name}
                    </Badge>
                  ))}
                  {(user.desired_skills || []).length > 3 && (
                    <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                      +{(user.desired_skills || []).length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Availability</h4>
              <p className="text-xs text-gray-600">
                {discoveryService.formatAvailability(user.availability_slots || [])}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">
                  ⭐ {user.rating_avg.toFixed(1)} ({user.total_sessions} sessions)
                </span>
              </div>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleUserProfile(user.id);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm px-4 py-2 transition-all duration-200 hover:scale-105 shadow-md"
              >
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPerfectMatch = (match: PerfectMatch) => (
    <Card key={match.user.id} className="group bg-green-50 border-2 border-green-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-12 w-12 ring-4 ring-green-100 group-hover:ring-green-200 transition-all duration-300">
            <AvatarImage src={match.user.avatar_url} alt={match.user.name} />
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-500 text-white">
              {match.user.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">{match.user.name}</h3>
            <p className="text-sm text-gray-600">{match.user.location}</p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-green-100 text-green-800 border-0">
              Perfect Match ✨
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-gray-700">Skill Exchange Potential</h4>
          {(match.perfect_match_details.bidirectional_skills || []).map((skill, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">
                  {skill.alex_teaches ? '🎓 You teach' : '📚 You learn'}
                </span>
                <span className="text-xs text-gray-600">↔️</span>
                <span className="text-xs text-gray-600">
                  {skill.sarah_teaches ? '🎓 They teach' : '📚 They learn'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Compatibility:</span> {Math.round(match.perfect_match_details.compatibility_score * 100)}%
          </div>
          <Button 
            onClick={() => handleUserProfile(match.user.id)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-200 hover:scale-105 shadow-md"
          >
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mb-4">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
          <Button 
            onClick={loadInitialData} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skill Swap Platform
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                Welcome, {currentUser?.name}!
              </span>
              <Button 
                onClick={handleSwapRequest}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-md"
              >
                Swap Requests
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar 
                  className="h-10 w-10 cursor-pointer ring-2 ring-blue-200 hover:ring-blue-300 transition-all duration-200" 
                  onClick={handleProfile}
                >
                  <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 bg-transparent hover:bg-gray-100 rounded-full p-2 text-sm transition-all duration-200"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Platform Stats */}
        {platformStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-gray-900">{platformStats.total_users}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-gray-900">{platformStats.total_skills}</div>
                <div className="text-sm text-gray-600">Skills Available</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-gray-900">{platformStats.users_with_availability}</div>
                <div className="text-sm text-gray-600">Available Now</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-gray-900">{platformStats.avg_skills_per_user.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Skills/User</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Section */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search skills (e.g., React, Python, Design)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg bg-white/80 border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                />
              </div>
              <div className="w-full md:w-48">
                <input
                  type="text"
                  placeholder="Location filter..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg bg-white/80 border border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 transition-all duration-200 hover:scale-105 shadow-md"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm border-0 rounded-lg shadow-lg">
          <Tabs value={selectedTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 border-b border-gray-200">
              <TabsTrigger value="discover" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                Discover Users
              </TabsTrigger>
              <TabsTrigger value="matches" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                Smart Matches
              </TabsTrigger>
              <TabsTrigger value="perfect" className="text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-white">
                Perfect Matches
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="discover" className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Discover Users</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mb-4">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : (discoveredUsers || []).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No users found. Try adjusting your search criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(discoveredUsers || []).map(user => renderUserCard(user))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="matches" className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Matches</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mb-4">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <p className="text-gray-600">Finding your matches...</p>
                  </div>
                ) : (personalizedMatches || []).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No matches found. Complete your profile to get better matches.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(personalizedMatches || []).map(match => renderUserCard(match.user, match.compatibility))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="perfect" className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Perfect Matches</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mb-4">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <p className="text-gray-600">Finding perfect matches...</p>
                  </div>
                ) : (perfectMatches || []).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No perfect matches found. Try updating your skills and desired skills.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(perfectMatches || []).map(match => renderPerfectMatch(match))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;



