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
    navigate('/');
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
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            {isEditing ? (
              <div className="flex gap-3">
                <Button 
                  onClick={handleSave}
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8 py-2 text-base"
                >
                  Save
                </Button>
                <Button 
                  onClick={handleDiscard}
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
              onClick={handleSwapRequest}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8 py-2 text-base"
            >
              Swap Request
            </Button>
            <Button 
              onClick={handleHome}
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8 py-2 text-base"
            >
              Home
            </Button>
            <Avatar className="h-12 w-12 bg-blue-100 text-blue-600 border-2 border-blue-200">
              <AvatarImage src={userData.avatar || undefined} alt={userData.name} />
              <AvatarFallback>
                {userData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
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
                  className="border border-gray-300 rounded-md h-12 px-4 py-2 text-base w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <div className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {userData.location}
                </div>
              )}
            </div>
            
            {/* Skills Offered */}
            <div>
              <label className="block text-base font-medium text-green-700 mb-4">Skills Offered</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {skillsOffered.map((skill, index) => (
                  <Badge 
                    key={index} 
                    className="bg-green-100 text-green-800 hover:bg-green-200 rounded-full px-4 py-2 text-sm font-medium flex items-center"
                    onClick={() => isEditing && handleRemoveSkill('offered', index)}
                  >
                    {skill} 
                    {isEditing && (
                      <span className="ml-2 cursor-pointer">×</span>
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
                    className="border border-green-200 rounded-full h-12 px-4 py-2 text-base flex-1 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill('offered')}
                  />
                  <Button 
                    onClick={() => handleAddSkill('offered')}
                    className="bg-green-600 text-white hover:bg-green-700 rounded-full px-6 h-12 text-base"
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
            {/* Profile Photo */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-4 text-center">Profile Photo</label>
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <Avatar className="h-48 w-48 bg-blue-100 text-blue-600 text-4xl border-2 border-blue-200">
                    <AvatarImage src={userData.avatar || undefined} alt={userData.name} />
                    <AvatarFallback>
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
                      className="text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-50 text-sm"
                    >
                      Add/Edit
                    </Button>
                    <Button 
                      onClick={removeAvatar}
                      className="text-red-600 hover:text-red-800 bg-transparent hover:bg-red-50 text-sm"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Skills Wanted */}
            <div>
              <label className="block text-base font-medium text-blue-700 mb-4">Skills Wanted</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {skillsWanted.map((skill, index) => (
                  <Badge 
                    key={index} 
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full px-4 py-2 text-sm font-medium flex items-center"
                    onClick={() => isEditing && handleRemoveSkill('wanted', index)}
                  >
                    {skill}
                    {isEditing && (
                      <span className="ml-2 cursor-pointer">×</span>
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
                    className="border border-blue-200 rounded-full h-12 px-4 py-2 text-base flex-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill('wanted')}
                  />
                  <Button 
                    onClick={() => handleAddSkill('wanted')}
                    className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-6 h-12 text-base"
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

