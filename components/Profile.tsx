import React, { useRef, useState, useEffect } from 'react';
import { User, Post } from '../types';
import { CameraIcon, EditIcon } from './Icons';

interface ProfileProps {
  user: User;
  posts: Post[];
  isCurrentUser: boolean;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, posts, isCurrentUser, onUpdateUser }) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.fullName);
  const [editBio, setEditBio] = useState(user.bio);
  
  const [bannerError, setBannerError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setEditName(user.fullName);
    setEditBio(user.bio);
    setIsEditing(false);
    setBannerError(false);
    setAvatarError(false);
  }, [user]);

  const handleImageUpdate = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({
          ...user,
          [field]: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleSave = () => {
    onUpdateUser({
      ...user,
      fullName: editName,
      bio: editBio
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20">
      {/* Banner Area */}
      <div className="relative w-full h-48 md:h-64 bg-gray-200 group overflow-hidden">
        {user.banner && !bannerError ? (
          <img 
            src={user.banner} 
            alt="Banner" 
            className="w-full h-full object-cover" 
            onError={() => setBannerError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gek-400 to-indigo-200" />
        )}
        
        {isCurrentUser && (
          <button 
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-4 right-4 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all backdrop-blur-sm"
            title="Change banner"
          >
            <CameraIcon />
          </button>
        )}
        <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpdate(e, 'banner')} />
      </div>

      {/* Info Section */}
      <div className="px-4 md:px-8 relative">
        {/* Avatar */}
        <div className="absolute -top-16 left-4 md:left-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-sm">
              {user.avatar && !avatarError ? (
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-full h-full object-cover" 
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                   <UserIcon />
                </div>
              )}
            </div>
            {isCurrentUser && (
              <button 
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full hover:bg-black/40 transition-colors text-white"
                title="Change profile picture"
              >
                <CameraIcon />
              </button>
            )}
             <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpdate(e, 'avatar')} />
          </div>
        </div>

        {/* Action Buttons (Right aligned) */}
        <div className="flex justify-end pt-4 gap-2">
          {isCurrentUser ? (
            isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="px-4 py-2 bg-gek-600 text-white rounded-lg font-semibold text-sm hover:bg-gek-500 transition-colors"
                >
                  Save
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Edit profile
              </button>
            )
          ) : (
            <button className="px-6 py-2 bg-gek-600 text-white rounded-lg font-semibold text-sm hover:bg-gek-500 transition-colors">
              Follow
            </button>
          )}
        </div>

        {/* User Details */}
        <div className="mt-6 md:mt-4">
            {isEditing ? (
              <div className="space-y-3 mb-4 max-w-lg">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-xl font-bold w-full focus:border-gek-500 outline-none transition-colors"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Bio</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm w-full h-24 resize-none focus:border-gek-500 outline-none transition-colors"
                    placeholder="Bio"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold">{user.fullName}</h1>
                <p className="text-gray-500">@{user.username}</p>
                <p className="mt-3 text-sm md:text-base max-w-lg whitespace-pre-line">{user.bio}</p>
              </>
            )}

            {/* Stats Section - Enhanced */}
            <div className="flex items-center gap-8 mt-6 py-4 border-y border-gray-50 md:border-none md:p-0">
                <div className="flex flex-col md:flex-row md:items-center md:gap-1">
                    <span className="font-bold text-black text-lg md:text-base">{posts.length}</span>
                    <span className="text-gray-500 text-xs md:text-base font-normal">posts</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:gap-1">
                    <span className="font-bold text-black text-lg md:text-base">{user.followers.toLocaleString()}</span>
                    <span className="text-gray-500 text-xs md:text-base font-normal">followers</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:gap-1">
                    <span className="font-bold text-black text-lg md:text-base">{user.following.toLocaleString()}</span>
                    <span className="text-gray-500 text-xs md:text-base font-normal">following</span>
                </div>
            </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex border-t border-gray-200 mt-4 md:mt-8">
        <button className="flex-1 py-4 text-xs md:text-sm font-semibold border-t border-black tracking-widest flex items-center justify-center gap-2 text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m21 9-18 0"/><path d="m21 15-18 0"/><path d="M15 3v18"/></svg>
            POSTS
        </button>
        <button className="flex-1 py-4 text-xs md:text-sm font-semibold text-gray-500 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
            SAVED
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-6 lg:gap-8 px-0 md:px-0">
        {posts.map(post => (
          <div key={post.id} className="aspect-square bg-gray-100 group relative cursor-pointer overflow-hidden rounded-sm md:rounded-md">
            <img 
              src={post.imageUrl} 
              alt="" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold backdrop-blur-[2px]">
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    {post.likes}
                </div>
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                    {post.comments.length}
                </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
            <div className="col-span-3