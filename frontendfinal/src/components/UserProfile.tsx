import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Settings, Mail, Calendar, User, Edit3, X, Save, Loader2, Shield, ChefHat } from 'lucide-react';
import { useAuth } from './AuthContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditProfileForm {
  name: string;
  email: string;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditProfileForm>({
    name: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [hasValidUserData, setHasValidUserData] = useState(false);

  // Fetch fresh user data when dialog opens
  useEffect(() => {
    if (isOpen && user) {
      fetchUserData();
    }
  }, [isOpen, user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://127.0.0.1:8000/verify/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserData(userData);
        setEditForm({
          name: userData.name || userData.username || '',
          email: userData.email || '',
        });
        setHasValidUserData(true);
      } else {
        if (user && user.user_id) {
          setUserData(user);
          setEditForm({
            name: user.name || '',
            email: user.email || '',
          });
          setHasValidUserData(true);
        }
      }
    } catch (error) {
      if (user && user.user_id) {
        setUserData(user);
        setEditForm({
          name: user.name || '',
          email: user.email || '',
        });
        setHasValidUserData(true);
      }
    }
  };

  if (!user || !hasValidUserData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              My Profile
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-orange-500" />
            <p className="text-gray-600 text-sm">Loading profile...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const displayUser = userData || user;

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      console.log('Updating profile with:', {
        name: editForm.name,
        email: editForm.email,
        user_id: displayUser.user_id
      });

      const response = await fetch(`http://127.0.0.1:8000/profile/${displayUser.user_id}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Updated user:', updatedUser);
        
        // ✅ Update both local state and global auth state
        setUserData(updatedUser);
        updateUser(updatedUser); // This updates the AuthContext
        setIsEditing(false);
        
        // Optional: Show success message
        alert('Profile updated successfully!');
        
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(errorData.message || errorData.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: displayUser.name || displayUser.username || '',
      email: displayUser.email || '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-xl max-h-[90vh] overflow-y-auto">
        {/* Compact Header - Centered */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6 text-white text-center">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-center relative">
              <DialogTitle className="text-xl font-bold">My Profile</DialogTitle>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditProfile}
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full absolute right-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Centered User Info - Fixed text visibility */}
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-16 w-16 border-2 border-white/30 bg-orange-400">
                <AvatarImage src={displayUser.avatar} />
                <AvatarFallback className="bg-orange-500 text-white text-lg font-bold">
                  {getInitials(displayUser.name || displayUser.username)}
                </AvatarFallback>
              </Avatar>
              </div>
          </DialogHeader>
        </div>

        {/* Compact Content - Centered */}
        <div className="px-6 py-6 space-y-6 bg-gray-50/50">
          {/* Profile Information Card */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-lg flex items-center justify-center space-x-2">
                <User className="h-5 w-5 text-orange-600" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 text-center block">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center"
                        placeholder="Enter your full name"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 text-center block">Email Address</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center"
                        placeholder="Enter your email"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Button 
                      onClick={handleSaveProfile}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 rounded-lg font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      className="flex-1 py-2 rounded-lg font-medium border transition-all"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 text-center">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">FULL NAME</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {displayUser.name || displayUser.username || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">EMAIL ADDRESS</p>
                      <p className="text-sm font-semibold text-gray-900">{displayUser.email || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">MEMBER SINCE</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(displayUser.joinDate || displayUser.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleEditProfile}
                    variant="outline" 
                    className="w-full py-2 rounded-lg font-medium border border-orange-200 text-orange-600 hover:bg-orange-50"
                    disabled={isLoading}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Centered Stats Section */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm rounded-xl bg-green-50">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <Shield className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Status</h3>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-xl bg-blue-50">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <ChefHat className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Recipes</h3>
                    <p className="text-xs text-gray-600">0 created</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}