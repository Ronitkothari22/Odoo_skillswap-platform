import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profileService, UserProfile as ProfileType, Skill, AvailabilitySlot } from '../services/profileService';
import { authService } from '../services/authService';

function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editing
  const [userData, setUserData] = useState({
    name: '',
    location: '',
    visibility: true,
    avatar_url: ''
  });
  
  const [skillsOffered, setSkillsOffered] = useState<Skill[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<Skill[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  
  // Form inputs for new skills
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillOfferedProficiency, setNewSkillOfferedProficiency] = useState(3);
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [newSkillWantedPriority, setNewSkillWantedPriority] = useState(3);
  
  // Form inputs for new availability
  const [newAvailabilityWeekday, setNewAvailabilityWeekday] = useState(1);
  const [newAvailabilityStartTime, setNewAvailabilityStartTime] = useState('09:00');
  const [newAvailabilityEndTime, setNewAvailabilityEndTime] = useState('17:00');

  // Check authentication on mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/signin');
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Add debugging info
      console.log('🔍 Loading profile...');
      console.log('🔍 Authentication status:', authService.isAuthenticated());
      console.log('🔍 Token present:', !!localStorage.getItem('access_token'));
      console.log('🔍 Token expires at:', localStorage.getItem('token_expires_at'));
      authService.logAuthState();
      
      const profileData = await profileService.getProfile();
      
      setProfile(profileData);
      setUserData({
        name: profileData.name,
        location: profileData.location || '',
        visibility: profileData.visibility,
        avatar_url: profileData.avatar_url || ''
      });
      setSkillsOffered(profileData.skills || []);
      setSkillsWanted(profileData.desiredSkills || []);
      setAvailability(profileData.availability || []);
    } catch (error) {
      console.error('Failed to load profile:', error);
      authService.logAuthState(); // Log auth state when error occurs
      
      // If it's a token issue, try to refresh
      if (error instanceof Error && error.message.includes('Invalid or expired token')) {
        console.log('🔍 Token issue detected, attempting refresh...');
        try {
          const refreshResult = await authService.refreshToken();
          if (refreshResult.success) {
            console.log('✅ Token refreshed, retrying profile load...');
            // Retry loading profile
            const profileData = await profileService.getProfile();
            setProfile(profileData);
            setUserData({
              name: profileData.name,
              location: profileData.location || '',
              visibility: profileData.visibility,
              avatar_url: profileData.avatar_url || ''
            });
            setSkillsOffered(profileData.skills || []);
            setSkillsWanted(profileData.desiredSkills || []);
            setAvailability(profileData.availability || []);
            return;
          } else {
            console.log('❌ Token refresh failed');
            setError('Session expired. Please login again.');
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          setError('Session expired. Please login again.');
        }
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddSkill = async (type: 'offered' | 'wanted') => {
    try {
      if (type === 'offered' && newSkillOffered.trim()) {
        const skillsToAdd = [...skillsOffered, { name: newSkillOffered.trim(), proficiency: newSkillOfferedProficiency }];
        await profileService.updateSkills({
          skills: skillsToAdd.map(skill => ({ name: skill.name, proficiency: skill.proficiency || 3 }))
        });
        await loadProfile(); // Reload to get updated data with IDs
        setNewSkillOffered('');
        setNewSkillOfferedProficiency(3);
      } else if (type === 'wanted' && newSkillWanted.trim()) {
        const skillsToAdd = [...skillsWanted, { name: newSkillWanted.trim(), priority: newSkillWantedPriority }];
        await profileService.updateDesiredSkills({
          skills: skillsToAdd.map(skill => ({ name: skill.name, priority: skill.priority || 3 }))
        });
        await loadProfile(); // Reload to get updated data with IDs
        setNewSkillWanted('');
        setNewSkillWantedPriority(3);
      }
    } catch (error) {
      console.error('Failed to add skill:', error);
      setError('Failed to add skill. Please try again.');
    }
  };
  
  const handleRemoveSkill = async (type: 'offered' | 'wanted', skillId: string) => {
    try {
      if (type === 'offered') {
        await profileService.removeSkill(skillId);
      } else {
        await profileService.removeDesiredSkill(skillId);
      }
      await loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to remove skill:', error);
      setError('Failed to remove skill. Please try again.');
    }
  };

  const handleAddAvailability = async () => {
    try {
      if (newAvailabilityStartTime >= newAvailabilityEndTime) {
        setError('End time must be after start time');
        return;
      }

      // Helper function to ensure time format is HH:MM (pad single digits)
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      };

      const newSlot = {
        weekday: newAvailabilityWeekday,
        start_time: formatTime(newAvailabilityStartTime),
        end_time: formatTime(newAvailabilityEndTime)
      };

      // Debug: Log what we're sending
      console.log('🔍 Sending availability data:', newSlot);
      console.log('🔍 Original times:', { 
        start: newAvailabilityStartTime, 
        end: newAvailabilityEndTime 
      });

      // Format existing slots to ensure consistency
      const formattedExistingSlots = availability.map(slot => ({
        weekday: slot.weekday,
        start_time: formatTime(slot.start_time),
        end_time: formatTime(slot.end_time)
      }));

      const updatedSlots = [...formattedExistingSlots, newSlot];
      console.log('🔍 All slots being sent:', updatedSlots);
      
      await profileService.updateAvailability({ slots: updatedSlots });
      
      // Reset form
      setNewAvailabilityWeekday(1);
      setNewAvailabilityStartTime('09:00');
      setNewAvailabilityEndTime('17:00');
      
      await loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to add availability:', error);
      setError('Failed to add availability. Please try again.');
    }
  };

  const handleRemoveAvailability = async (slotId: string) => {
    try {
      await profileService.removeAvailabilitySlot(slotId);
      await loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to remove availability:', error);
      setError('Failed to remove availability. Please try again.');
    }
  };

  const getWeekdayOptions = () => [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];
  
  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      // Update basic profile information
      await profileService.updateProfile({
        name: userData.name,
        location: userData.location || undefined,
        visibility: userData.visibility,
        avatar_url: userData.avatar_url || undefined
      });
      
      await loadProfile(); // Reload to get updated data
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDiscard = () => {
    if (profile) {
      setUserData({
        name: profile.name,
        location: profile.location || '',
        visibility: profile.visibility,
        avatar_url: profile.avatar_url || ''
      });
    }
    setIsEditing(false);
  };
  
  const handleHome = () => {
    navigate('/');
  };
  
  const handleDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, avatar_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const removeAvatar = () => {
    setUserData(prev => ({ ...prev, avatar_url: '' }));
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRefreshToken = async () => {
    try {
      setLoading(true);
      const refreshResult = await authService.refreshToken();
      if (refreshResult.success) {
        await loadProfile();
      } else {
        setError('Failed to refresh token. Please login again.');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setError('Failed to refresh token. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReLogin = () => {
    localStorage.clear();
    navigate('/signin');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!profile) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error || 'Failed to load profile'}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={loadProfile} className="bg-blue-600 text-white hover:bg-blue-700">
              Try Again
            </Button>
            {error.includes('Session expired') && (
              <>
                <Button onClick={handleRefreshToken} className="bg-yellow-600 text-white hover:bg-yellow-700">
                  Refresh Token
                </Button>
                <Button onClick={handleReLogin} className="bg-red-600 text-white hover:bg-red-700">
                  Re-Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            {isEditing ? (
              <div className="flex gap-3">
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8 py-2 text-base"
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  onClick={handleDiscard}
                  disabled={saving}
                  className="bg-white text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-full px-8 py-2 text-base"
                >
                  Discard
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8 py-2 text-base"
              >
                Edit Profile
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleDashboard}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8 py-2 text-base"
            >
              Dashboard
            </Button>
            <Button 
              onClick={handleHome}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8 py-2 text-base"
            >
              Home
            </Button>
            <Avatar className="h-12 w-12 bg-blue-100 text-blue-600 border-2 border-blue-200">
              <AvatarImage src={userData.avatar_url || undefined} alt={userData.name} />
              <AvatarFallback>
                {getUserInitials(userData.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            {/* Name */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">Name</label>
              {isEditing ? (
                <Input
                  value={userData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border border-gray-300 rounded-md h-12 px-4 py-2 text-base w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <div className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {userData.name}
                </div>
              )}
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">Location</label>
              {isEditing ? (
                <Input
                  value={userData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter your location"
                  className="border border-gray-300 rounded-md h-12 px-4 py-2 text-base w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <div className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {userData.location || 'Not specified'}
                </div>
              )}
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">Profile Visibility</label>
              {isEditing ? (
                <Select 
                  value={userData.visibility ? 'public' : 'private'} 
                  onValueChange={(value) => handleInputChange('visibility', value === 'public')}
                >
                  <SelectTrigger className="border border-gray-300 rounded-md h-12 px-4 py-2 text-base w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {userData.visibility ? 'Public' : 'Private'}
                </div>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-3">Rating</label>
              <div className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                {profile.rating_avg.toFixed(1)}/5.0 ⭐
              </div>
            </div>
            
            {/* Skills Offered */}
            <div>
              <label className="block text-base font-medium text-green-700 mb-4">Skills Offered</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {skillsOffered.map((skill) => (
                  <Badge 
                    key={skill.id} 
                    className="bg-green-100 text-green-800 hover:bg-green-200 rounded-full px-4 py-2 text-sm font-medium flex items-center"
                    onClick={() => isEditing && handleRemoveSkill('offered', skill.id)}
                  >
                    {skill.name} ({skill.proficiency}/5)
                    {isEditing && (
                      <span className="ml-2 cursor-pointer">×</span>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2 flex-wrap">
                  <Input
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    placeholder="Add a skill"
                    className="border border-green-200 rounded-full h-12 px-4 py-2 text-base flex-1 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill('offered')}
                  />
                  <Select 
                    value={newSkillOfferedProficiency.toString()} 
                    onValueChange={(value) => setNewSkillOfferedProficiency(parseInt(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => handleAddSkill('offered')}
                    className="bg-green-600 text-white hover:bg-green-700 rounded-full px-6 py-2 text-base"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Avatar */}
            {isEditing && (
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-gray-300">
                    <AvatarImage src={userData.avatar_url || undefined} alt={userData.name} />
                    <AvatarFallback>
                      {getUserInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <Button 
                      onClick={triggerFileUpload}
                      variant="outline"
                      className="text-sm px-4 py-2"
                    >
                      Upload
                    </Button>
                    <Button 
                      onClick={removeAvatar}
                      variant="outline"
                      className="text-sm px-4 py-2"
                    >
                      Remove
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Skills Wanted */}
            <div>
              <label className="block text-base font-medium text-blue-700 mb-4">Skills Wanted</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {skillsWanted.map((skill) => (
                  <Badge 
                    key={skill.id} 
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full px-4 py-2 text-sm font-medium flex items-center"
                    onClick={() => isEditing && handleRemoveSkill('wanted', skill.id)}
                  >
                    {skill.name} (Priority: {skill.priority}/5)
                    {isEditing && (
                      <span className="ml-2 cursor-pointer">×</span>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2 flex-wrap">
                  <Input
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    placeholder="Add a desired skill"
                    className="border border-blue-200 rounded-full h-12 px-4 py-2 text-base flex-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill('wanted')}
                  />
                  <Select 
                    value={newSkillWantedPriority.toString()} 
                    onValueChange={(value) => setNewSkillWantedPriority(parseInt(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => handleAddSkill('wanted')}
                    className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-6 py-2 text-base"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            {/* Availability */}
            <div>
              <label className="block text-base font-medium text-purple-700 mb-4">Availability</label>
              <div className="space-y-2">
                {availability.map((slot) => (
                  <div 
                    key={slot.id} 
                    className="bg-purple-100 text-purple-800 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-between"
                  >
                    <span>
                      {profileService.getWeekdayName(slot.weekday)}: {' '}
                      {profileService.formatTime(slot.start_time)} - {profileService.formatTime(slot.end_time)}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveAvailability(slot.id)}
                        className="ml-2 text-purple-600 hover:text-purple-800 cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {availability.length === 0 && (
                  <p className="text-gray-500 text-sm">No availability set</p>
                )}
              </div>
              {isEditing && (
                <div className="flex gap-2 flex-wrap mt-4">
                  <Select 
                    value={newAvailabilityWeekday.toString()} 
                    onValueChange={(value) => setNewAvailabilityWeekday(parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getWeekdayOptions().map(option => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="time"
                    value={newAvailabilityStartTime}
                    onChange={(e) => setNewAvailabilityStartTime(e.target.value)}
                    className="border border-purple-200 rounded-md h-12 px-4 py-2 text-base w-28 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <span className="text-gray-600 flex items-center">to</span>
                  <Input
                    type="time"
                    value={newAvailabilityEndTime}
                    onChange={(e) => setNewAvailabilityEndTime(e.target.value)}
                    className="border border-purple-200 rounded-md h-12 px-4 py-2 text-base w-28 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <Button 
                    onClick={handleAddAvailability}
                    className="bg-purple-600 text-white hover:bg-purple-700 rounded-full px-6 py-2 text-base"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

