import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function UserProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userData, setUserData] = useState({
    name: 'John Doe',
    location: 'New York',
    availability: 'Weekends',
    profileType: 'Public',
    avatar: ''
  });
  
  const [skillsOffered, setSkillsOffered] = useState<string[]>(['Web Dev', 'Cooking', 'Photography']);
  const [skillsWanted, setSkillsWanted] = useState<string[]>(['Design', 'Marketing', 'Coding']);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [isEditing, setIsEditing] = useState(true); // Set to true to show edit mode by default
  
  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddSkill = (type: 'offered' | 'wanted') => {
    if (type === 'offered' && newSkillOffered.trim()) {
      setSkillsOffered([...skillsOffered, newSkillOffered.trim()]);
      setNewSkillOffered('');
    } else if (type === 'wanted' && newSkillWanted.trim()) {
      setSkillsWanted([...skillsWanted, newSkillWanted.trim()]);
      setNewSkillWanted('');
    }
  };
  
  const handleRemoveSkill = (type: 'offered' | 'wanted', index: number) => {
    if (type === 'offered') {
      setSkillsOffered(skillsOffered.filter((_, i) => i !== index));
    } else {
      setSkillsWanted(skillsWanted.filter((_, i) => i !== index));
    }
  };
  
  const handleSave = () => {
    console.log('Saving profile:', { ...userData, skillsOffered, skillsWanted });
    setIsEditing(false);
  };
  
  const handleDiscard = () => {
    setIsEditing(false);
  };
  
  const handleHome = () => {
    navigate('/dashboard');
  };
  
  const handleSwapRequest = () => {
    console.log('Navigate to swap requests');
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const removeAvatar = () => {
    setUserData(prev => ({ ...prev, avatar: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white">
      {/* Header with glass effect */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Skill Swap Platform</h1>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleSwapRequest}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-full px-6 py-2 text-sm font-medium shadow-md transition-all duration-200 hover:shadow-lg"
              >
                Swap Request
              </Button>
              <Button 
                onClick={handleHome}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 rounded-full px-6 py-2 text-sm font-medium shadow-md transition-all duration-200 hover:shadow-lg"
              >
                Dashboard
              </Button>
              <Avatar className="h-10 w-10 ring-2 ring-blue-200 shadow-sm">
                <AvatarImage src={userData.avatar || undefined} alt={userData.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                  {userData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with card design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Profile header with action buttons */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
            {isEditing ? (
              <div className="flex gap-3">
                <Button 
                  onClick={handleSave}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-full px-8 py-2 text-base font-medium shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  Save Changes
                </Button>
                <Button 
                  onClick={handleDiscard}
                  className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-full px-8 py-2 text-base font-medium shadow-sm transition-all duration-200"
                >
                  Discard
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 rounded-full px-8 py-2 text-base font-medium shadow-md transition-all duration-200 hover:shadow-lg"
              >
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile content with improved layout */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              {/* Name field with improved styling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                {isEditing ? (
                  <Input
                    value={userData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="border border-gray-300 rounded-lg h-12 px-4 py-2 text-base w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                    className="border border-gray-300 rounded-md h-12 px-4 py-2 text-base w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    {userData.location}
                  </div>
                )}
              </div>
            
              {/* Skills Offered with improved styling */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-3">Skills Offered</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skillsOffered.map((skill, index) => (
                    <Badge 
                      key={index} 
                      className="bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 hover:from-emerald-100 hover:to-green-200 rounded-full px-4 py-2 text-sm font-medium flex items-center shadow-sm transition-all duration-200"
                      onClick={() => isEditing && handleRemoveSkill('offered', index)}
                    >
                      {skill} 
                      {isEditing && (
                        <span className="ml-2 cursor-pointer hover:text-red-500 transition-colors">×</span>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newSkillOffered}
                      onChange={(e) => setNewSkillOffered(e.target.value)}
                      placeholder="Add a skill"
                      className="border border-emerald-200 rounded-full h-12 px-4 py-2 text-base flex-1 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill('offered')}
                    />
                    <Button 
                      onClick={() => handleAddSkill('offered')}
                      className="bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 rounded-full px-6 h-12 text-base shadow-md transition-all duration-200 hover:shadow-lg"
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            
              {/* Availability */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">Availability</label>
                {isEditing ? (
                  <Select 
                    value={userData.availability}
                    onValueChange={(value) => handleInputChange('availability', value)}
                  >
                    <SelectTrigger className="border border-gray-300 rounded-md h-12 px-4 py-2 text-base w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekdays">Weekdays</SelectItem>
                      <SelectItem value="Weekends">Weekends</SelectItem>
                      <SelectItem value="Evenings">Evenings</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    {userData.availability}
                  </div>
                )}
              </div>
            
              {/* Profile Type */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">Profile</label>
                {isEditing ? (
                  <Select 
                    value={userData.profileType}
                    onValueChange={(value) => handleInputChange('profileType', value)}
                  >
                    <SelectTrigger className="border border-gray-300 rounded-md h-12 px-4 py-2 text-base w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue placeholder="Select profile type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    {userData.profileType}
                  </div>
                )}
              </div>
            </div>
          
            <div className="space-y-8">
              {/* Profile Photo with improved styling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Profile Photo</label>
                <div className="flex flex-col items-center">
                  <div className="mb-4">
                    <Avatar className="h-48 w-48 ring-4 ring-blue-200 shadow-lg">
                      <AvatarImage 
                        src={userData.avatar || undefined} 
                        alt={userData.name}
                        className="object-cover" 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-4xl font-bold">
                        {userData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {isEditing && (
                    <div className="flex gap-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      <Button 
                        onClick={triggerFileUpload}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                      >
                        Add/Edit
                      </Button>
                      <Button 
                        onClick={removeAvatar}
                        className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            
              {/* Skills Wanted with improved styling */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-3">Skills Wanted</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skillsWanted.map((skill, index) => (
                    <Badge 
                      key={index} 
                      className="bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-800 hover:from-blue-100 hover:to-indigo-200 rounded-full px-4 py-2 text-sm font-medium flex items-center shadow-sm transition-all duration-200"
                      onClick={() => isEditing && handleRemoveSkill('wanted', index)}
                    >
                      {skill}
                      {isEditing && (
                        <span className="ml-2 cursor-pointer hover:text-red-500 transition-colors">×</span>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newSkillWanted}
                      onChange={(e) => setNewSkillWanted(e.target.value)}
                      placeholder="Add a skill"
                      className="border border-blue-200 rounded-full h-12 px-4 py-2 text-base flex-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill('wanted')}
                    />
                    <Button 
                      onClick={() => handleAddSkill('wanted')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 rounded-full px-6 h-12 text-base shadow-md transition-all duration-200 hover:shadow-lg"
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
    </div>
  );
}

export default UserProfile;

