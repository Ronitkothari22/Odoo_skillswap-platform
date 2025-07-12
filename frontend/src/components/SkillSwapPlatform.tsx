import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Users, TrendingUp, Globe, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import discoveryService, { DiscoveryUser, PlatformStats } from '../services/discoveryService';

function SkillSwapPlatform() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<DiscoveryUser[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    loadData();
    // Trigger animations after component mounts
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersResponse, statsResponse] = await Promise.all([
        discoveryService.getAllUsersPublic({ page: 1, limit: 20 }),
        discoveryService.getPlatformStatsPublic()
      ]);

      setUsers(usersResponse.data);
      setPlatformStats(statsResponse);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await discoveryService.searchUsersPublic({
        skills: searchTerm,
        location: locationFilter === 'all' ? undefined : locationFilter,
        page: 1,
        limit: 20
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = (_userId: string, userName: string) => {
    navigate('/signin', { state: { message: `Sign in to connect with ${userName}` } });
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
                         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.skills || []).some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = locationFilter === 'all' || 
                           user.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Header */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-12 transform transition-all duration-1000 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Skill Swap Platform
              </h1>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleSignIn}
                variant="outline"
                className="border-2 border-blue-200 hover:border-blue-300 bg-white/80 backdrop-blur-sm rounded-xl px-6 py-2 font-semibold text-sm transition-all duration-200 hover:scale-105"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-2 font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* Hero Content */}
          <div className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Learn, Teach, and 
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Grow Together
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with skilled professionals worldwide. Exchange knowledge, build connections, and accelerate your learning journey.
            </p>
          </div>

          {/* Platform Stats */}
          {platformStats && (
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 transform transition-all duration-1000 delay-300 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{platformStats.total_users}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{platformStats.total_skills}</div>
                  <div className="text-sm text-gray-600">Skills Available</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{platformStats.total_locations}</div>
                  <div className="text-sm text-gray-600">Locations</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{platformStats.users_with_availability}</div>
                  <div className="text-sm text-gray-600">Available Now</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Section */}
          <div className={`transform transition-all duration-1000 delay-400 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="w-full sm:w-56">
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="bg-white/80 border-gray-200 rounded-xl h-12 transition-all duration-200 hover:border-blue-300">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="pune">Pune</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3 flex-1">
                    <Input
                      placeholder="Search skills, users, or technologies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/80 border-gray-200 rounded-xl h-12 flex-1 transition-all duration-200 hover:border-blue-300 focus:border-blue-500"
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 h-12 font-semibold transition-all duration-200 hover:scale-105 shadow-md"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      {loading ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className={`mb-8 transform transition-all duration-1000 delay-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Discover Amazing People
          </h2>
          <p className="text-gray-600">
            Connect with skilled professionals and start your learning journey today
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin mb-4">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <p className="text-gray-600">Loading amazing people...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadData} className="bg-red-600 hover:bg-red-700 text-white">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* User Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user, index) => (
              <Card 
                key={user.id} 
                className={`group bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Avatar className="h-16 w-16 ring-4 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300">
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg font-semibold">
                        {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{user.location}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{user.rating_avg.toFixed(1)}</span>
                        <span className="mx-1">•</span>
                        <span>{user.total_sessions} sessions</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Offered */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered</h4>
                    <div className="flex flex-wrap gap-2">
                      {(user.skills || []).slice(0, 3).map((skill, skillIndex) => (
                        <Badge 
                          key={skillIndex}
                          className={`${discoveryService.getProficiencyColor(skill.proficiency)} border-0 text-xs transition-all duration-200 hover:scale-105`}
                        >
                          {skill.name} ({skill.proficiency})
                        </Badge>
                      ))}
                      {(user.skills || []).length > 3 && (
                        <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                          +{(user.skills || []).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Desired Skills */}
                  {user.desired_skills && user.desired_skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Looking to Learn</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.desired_skills.slice(0, 2).map((skill, skillIndex) => (
                          <Badge 
                            key={skillIndex}
                            className="bg-blue-100 text-blue-800 border-0 text-xs transition-all duration-200 hover:scale-105"
                          >
                            {skill.name}
                          </Badge>
                        ))}
                        {user.desired_skills.length > 2 && (
                          <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                            +{user.desired_skills.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Availability</h4>
                    <p className="text-xs text-gray-600">
                      {discoveryService.formatAvailability(user.availability_slots || [])}
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => handleRequest(user.id, user.name)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-3 font-semibold transition-all duration-200 hover:scale-105 shadow-md group"
                  >
                    Connect & Learn
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or location filter</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
                loadData();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillSwapPlatform; 