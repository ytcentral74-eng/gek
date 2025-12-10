import React, { useState, useEffect } from 'react';
import { User, Post, View } from './types';
import PostCard from './components/PostCard';
import Profile from './components/Profile';
import UploadModal from './components/UploadModal';
import { HomeIcon, SearchIcon, PlusSquareIcon, HeartIcon, UserIcon } from './components/Icons';

// --- MOCK DATA ---
const MOCK_USER: User = {
  id: 'current-user',
  username: 'gek_creator',
  fullName: 'Creative Soul',
  avatar: 'https://picsum.photos/150/150',
  banner: 'https://picsum.photos/800/200',
  bio: 'Digital explorer. 📸\nBuilding the future of social media with React.',
  followers: 1250,
  following: 420
};

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    userId: 'user-2',
    user: { ...MOCK_USER, id: 'user-2', username: 'travel_junkie', avatar: 'https://picsum.photos/151/151' },
    imageUrl: 'https://picsum.photos/600/600?random=1',
    caption: 'Lost in the city lights 🌃 #nightlife #vibes',
    likes: 89,
    comments: 12,
    timestamp: Date.now() - 3600000,
    likedByCurrentUser: false
  },
  {
    id: '2',
    userId: 'user-3',
    user: { ...MOCK_USER, id: 'user-3', username: 'art_daily', avatar: 'https://picsum.photos/152/152' },
    imageUrl: 'https://picsum.photos/600/600?random=2',
    caption: 'Abstract thoughts on a Tuesday. What do you see? 🎨',
    likes: 245,
    comments: 45,
    timestamp: Date.now() - 7200000,
    likedByCurrentUser: true
  }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<View>(View.LOGIN);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  
  // Track which user's profile we are viewing. If null, defaults to currentUser when in Profile View.
  const [profileUser, setProfileUser] = useState<User | null>(null);

  // Auto login if we were doing real auth, but here we just handle view state
  useEffect(() => {
    // Simulating initialization
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setCurrentUser({ ...MOCK_USER, username: usernameInput });
      setView(View.FEED);
    }
  };

  const handleCreatePost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    setView(View.FEED);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === postId) {
        const isNowLiked = !p.likedByCurrentUser;
        return {
          ...p,
          likedByCurrentUser: isNowLiked,
          likes: isNowLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  const handleGoToProfile = (user: User) => {
    setProfileUser(user);
    setView(View.PROFILE);
  };

  // Logic to determine which user object to display in Profile view
  const getDisplayUser = () => {
    const target = profileUser || currentUser;
    if (!target || !currentUser) return null;
    // If viewing self, return currentUser to ensure updates (like bio edits) are reflected immediately
    return target.id === currentUser.id ? currentUser : target;
  };

  const displayUser = getDisplayUser();
  const isOwnProfile = displayUser?.id === currentUser?.id;

  // --- LOGIN VIEW ---
  if (!currentUser || view === View.LOGIN) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4">
        <div className="w-full max-w-xs space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-tr from-gek-400 to-purple-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'cursive' }}>Gek</h1>
            <p className="text-gray-500">Connect, Share, Inspire.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-3 text-sm focus:border-gek-500 outline-none transition-colors"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-3 text-sm focus:border-gek-500 outline-none transition-colors"
              defaultValue="password123" // Fake
            />
            <button 
              type="submit" 
              className="w-full bg-gek-600 hover:bg-gek-500 text-white font-semibold py-3 rounded-md transition-colors"
            >
              Log In
            </button>
          </form>
          <div className="text-center text-sm text-gray-500">
            <p>Don't have an account? <span className="text-gek-400 cursor-pointer">Sign up</span></p>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP VIEW ---
  return (
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row">
      
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col w-[245px] h-screen border-r border-gray-200 fixed left-0 top-0 p-4 z-20 bg-white">
        <div className="mb-8 px-2">
           <h1 className="text-3xl font-bold bg-gradient-to-tr from-gek-400 to-purple-600 bg-clip-text text-transparent cursor-pointer" style={{ fontFamily: 'cursive' }} onClick={() => setView(View.FEED)}>Gek</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<HomeIcon active={view === View.FEED} />} label="Home" active={view === View.FEED} onClick={() => setView(View.FEED)} />
          <NavItem icon={<SearchIcon active={view === View.SEARCH} />} label="Search" active={view === View.SEARCH} onClick={() => setView(View.SEARCH)} />
          <NavItem icon={<PlusSquareIcon />} label="Create" onClick={() => setIsUploadOpen(true)} />
          <NavItem icon={<HeartIcon />} label="Notifications" />
          <NavItem 
            icon={<img src={currentUser.avatar} className="w-6 h-6 rounded-full border border-gray-200" />} 
            label="Profile" 
            active={view === View.PROFILE && isOwnProfile} 
            onClick={() => handleGoToProfile(currentUser)} 
          />
        </nav>
        <div className="px-2">
            <button className="flex items-center gap-4 p-3 w-full hover:bg-gray-100 rounded-lg transition-colors text-left">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                <span>More</span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[245px] min-h-screen w-full">
        <div className="max-w-4xl mx-auto pt-4 md:pt-8 px-0 md:px-4">
          
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md z-30 border-b border-gray-200 flex justify-between items-center p-4">
             <h1 className="text-2xl font-bold bg-gradient-to-tr from-gek-400 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'cursive' }}>Gek</h1>
             <div className="flex gap-4">
                <HeartIcon />
             </div>
          </div>

          {view === View.FEED && (
            <div className="flex flex-col gap-2 pb-20">
               {posts.map(post => (
                 <PostCard 
                  key={post.id} 
                  post={post} 
                  onLike={handleLikePost} 
                  onUserClick={handleGoToProfile}
                 />
               ))}
            </div>
          )}

          {view === View.PROFILE && displayUser && (
            <Profile 
              user={displayUser} 
              posts={posts.filter(p => p.userId === displayUser.id)} 
              isCurrentUser={isOwnProfile}
              onUpdateUser={handleUpdateUser}
            />
          )}

           {view === View.SEARCH && (
            <div className="p-4 w-full max-w-md mx-auto mt-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <input 
                        type="search" 
                        className="block w-full p-4 pl-10 text-sm bg-gray-100 border border-gray-200 rounded-lg placeholder-gray-500 text-black focus:border-gek-500 outline-none" 
                        placeholder="Search" 
                    />
                </div>
                <div className="mt-8 text-center text-gray-500">
                    <p>Search for users and friends.</p>
                </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-14 z-30">
        <button onClick={() => setView(View.FEED)}><HomeIcon active={view === View.FEED} /></button>
        <button onClick={() => setView(View.SEARCH)}><SearchIcon active={view === View.SEARCH} /></button>
        <button onClick={() => setIsUploadOpen(true)}><PlusSquareIcon /></button>
        <button onClick={() => handleGoToProfile(currentUser)}><UserIcon active={view === View.PROFILE && isOwnProfile} /></button>
      </div>

      {/* Modals */}
      {isUploadOpen && (
        <UploadModal 
          user={currentUser} 
          onClose={() => setIsUploadOpen(false)} 
          onUpload={handleCreatePost} 
        />
      )}
    </div>
  );
};

// Helper component for Sidebar items
const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 p-3 w-full hover:bg-gray-100 rounded-lg transition-all group ${active ? 'font-bold' : ''}`}
  >
    <span className="group-hover:scale-110 transition-transform">{icon}</span>
    <span className="text-base hidden lg:block">{label}</span>
  </button>
);

export default App;