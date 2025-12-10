import React, { useState, useEffect } from 'react';
import { User, Post, View, Comment, Notification } from './types';
import PostCard from './components/PostCard';
import Profile from './components/Profile';
import UploadModal from './components/UploadModal';
import NotificationsView from './components/NotificationsView';
import { HomeIcon, SearchIcon, PlusSquareIcon, HeartIcon, UserIcon, CameraIcon, LogOutIcon } from './components/Icons';

// --- CONSTANTS ---
const NEW_USER_TEMPLATE: Omit<User, 'id' | 'username' | 'fullName'> = {
  avatar: '', // Will be generated based on username
  banner: 'https://picsum.photos/seed/banner/800/200',
  bio: 'Digital explorer. 📸\nBuilding the future of social media.',
  followers: 0,
  following: 0
};

const LOGIN_MESSAGES = [
  { 
    title: "Capture Real Life.", 
    subtitle: "Share your world instantly with Gek.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop"
  },
  { 
    title: "Express Yourself.", 
    subtitle: "Post photos, stories, and moments that matter.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop"
  },
  { 
    title: "Connect Globally.", 
    subtitle: "Join a community of creators and friends.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop"
  },
  { 
    title: "Discover Trends.", 
    subtitle: "See what's happening in the world right now.",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop"
  },
  { 
    title: "Be Authentic.", 
    subtitle: "No filters needed. Just you and your vibe.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Share Moments.",
    subtitle: "Every picture tells a story. What's yours?",
    image: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Inspire Others.",
    subtitle: "Creativity is contagious. Pass it on.",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=800&auto=format&fit=crop"
  }
];

// Start with an empty feed
const INITIAL_POSTS: Post[] = [];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<View>(View.LOGIN);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  
  // Registry of all users who have ever logged in (persisted in localStorage)
  const [registry, setRegistry] = useState<User[]>([]);
  
  // Track which user's profile we are viewing. If null, defaults to currentUser when in Profile View.
  const [profileUser, setProfileUser] = useState<User | null>(null);

  // Initialize data from local storage
  useEffect(() => {
    // Load Registry
    const savedRegistry = localStorage.getItem('gek_registry');
    if (savedRegistry) {
      try {
        setRegistry(JSON.parse(savedRegistry));
      } catch (e) {
        console.error("Failed to load registry", e);
      }
    }

    // Load Current Session
    const savedUser = localStorage.getItem('gek_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setView(View.FEED);
      } catch (e) {
        console.error("Failed to restore user session", e);
        localStorage.removeItem('gek_user');
      }
    }
  }, []);

  // Text rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOGIN_MESSAGES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = usernameInput.trim();
    if (!trimmedUsername) return;

    // Check if user already exists in registry
    const existingUser = registry.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());

    let userToLogin: User;

    if (existingUser) {
      // Login existing user
      userToLogin = existingUser;
    } else {
      // Create new user and save to registry
      userToLogin = {
        ...NEW_USER_TEMPLATE,
        id: Date.now().toString(),
        username: trimmedUsername,
        fullName: trimmedUsername, // Default display name same as username
        avatar: `https://picsum.photos/seed/${trimmedUsername}/150/150`, // Deterministic random avatar
      };
      
      const newRegistry = [...registry, userToLogin];
      setRegistry(newRegistry);
      localStorage.setItem('gek_registry', JSON.stringify(newRegistry));
    }

    setCurrentUser(userToLogin);
    localStorage.setItem('gek_user', JSON.stringify(userToLogin));
    setView(View.FEED);
  };

  const handleLogout = () => {
    localStorage.removeItem('gek_user');
    setCurrentUser(null);
    setView(View.LOGIN);
    setUsernameInput('');
    setProfileUser(null);
    setNotifications([]);
    setSearchQuery('');
  };

  const handleCreatePost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    setView(View.FEED);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('gek_user', JSON.stringify(updatedUser));
    
    // Also update the user in the registry so search results show the new details
    const newRegistry = registry.map(u => u.id === updatedUser.id ? updatedUser : u);
    setRegistry(newRegistry);
    localStorage.setItem('gek_registry', JSON.stringify(newRegistry));
  };

  const createNotification = (type: 'LIKE' | 'COMMENT' | 'SHARE', post: Post, text?: string) => {
    if (!currentUser) return;
    
    const newNotification: Notification = {
      id: Date.now().toString() + Math.random(),
      type,
      user: currentUser,
      postId: post.id,
      postImage: post.imageUrl,
      text,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === postId) {
        const isNowLiked = !p.likedByCurrentUser;
        if (isNowLiked) {
           createNotification('LIKE', p);
        }
        return {
          ...p,
          likedByCurrentUser: isNowLiked,
          likes: isNowLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  const handleComment = (postId: string, text: string) => {
    if (!currentUser) return;
    
    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      text: text,
      timestamp: Date.now()
    };

    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === postId) {
        createNotification('COMMENT', p, text);
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));
  };

  const handleSharePost = (post: Post) => {
    createNotification('SHARE', post);
    alert('Post shared! (Action logged in notifications)');
  };

  const handleGoToProfile = (user: User) => {
    setProfileUser(user);
    setView(View.PROFILE);
  };

  // Logic to determine which user object to display in Profile view
  const getDisplayUser = () => {
    const target = profileUser || currentUser;
    if (!target || !currentUser) return null;
    return target.id === currentUser.id ? currentUser : target;
  };

  // Search Filtering Logic
  const getFilteredSearch = () => {
    const term = searchQuery.toLowerCase();
    
    // Search within the registry (all registered users)
    const users = searchQuery 
      ? registry.filter(u => u.username.toLowerCase().includes(term) || u.fullName.toLowerCase().includes(term))
      : registry;
      
    return { users };
  };

  const { users: filteredUsers } = getFilteredSearch();
  const displayUser = getDisplayUser();
  const isOwnProfile = displayUser?.id === currentUser?.id;

  // --- LOGIN VIEW ---
  if (!currentUser || view === View.LOGIN) {
    return (
      <div className="min-h-screen bg-white md:bg-gray-50 flex flex-col items-center justify-center p-0 md:p-4">
        
        {/* Main Login Container */}
        <main className="flex w-full max-w-[850px] items-center justify-center gap-8 min-h-screen md:min-h-0">
          
          {/* Left Side - Image Slider (Desktop only) - No Phone Frame */}
          <div className="hidden md:block relative w-[400px] h-[630px] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl">
             {/* Background Image - Rotates with messages */}
             <img 
               key={`img-${messageIndex}`}
               src={LOGIN_MESSAGES[messageIndex].image} 
               className="absolute inset-0 w-full h-full object-cover animate-[fadeIn_1s_ease-in-out]"
               alt="App Preview"
             />
             {/* Overlay Text */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-10">
                 <div className="text-white mb-8">
                     <p key={`title-${messageIndex}`} className="font-bold text-3xl mb-3 animate-[fadeIn_0.5s_ease-in-out] drop-shadow-md leading-tight">
                       {LOGIN_MESSAGES[messageIndex].title}
                     </p>
                     <p key={`sub-${messageIndex}`} className="text-lg opacity-90 animate-[fadeIn_0.8s_ease-in-out] drop-shadow-sm font-medium">
                       {LOGIN_MESSAGES[messageIndex].subtitle}
                     </p>
                 </div>
             </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-[350px] flex flex-col gap-3 p-4 md:p-0">
            
            {/* Login Box */}
            <div className="bg-white md:border md:border-gray-300 p-8 flex flex-col items-center rounded-sm">
              <h1 className="text-4xl font-bold text-black mb-8 mt-2 tracking-tight">Gek</h1>
              
              <form onSubmit={handleLogin} className="w-full space-y-2">
                <input 
                  type="text" 
                  placeholder="Phone number, username, or email" 
                  className="w-full bg-gray-50 border border-gray-300 rounded-sm px-2 py-2.5 text-xs text-black focus:border-gray-400 outline-none transition-colors placeholder-gray-500"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full bg-gray-50 border border-gray-300 rounded-sm px-2 py-2.5 text-xs text-black focus:border-gray-400 outline-none transition-colors placeholder-gray-500"
                />
                <button 
                  type="submit" 
                  className="w-full bg-gek-500 hover:bg-gek-600 text-white font-semibold py-1.5 rounded-[4px] text-sm transition-colors mt-2"
                >
                  Log in
                </button>
              </form>

              <div className="flex items-center w-full my-4">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <span className="px-4 text-xs text-gray-400 font-semibold">OR</span>
                  <div className="h-px bg-gray-300 flex-1"></div>
              </div>

              <button className="text-gek-900 font-semibold text-sm flex items-center gap-2 hover:opacity-80">
                  <span className="text-sm">Log in with Facebook</span>
              </button>
              <button className="text-xs text-gek-900/80 mt-4 hover:opacity-80">Forgot password?</button>
            </div>

            {/* Sign Up Box */}
            <div className="bg-white md:border md:border-gray-300 p-6 flex items-center justify-center rounded-sm">
                <p className="text-sm text-black">Don't have an account? <button onClick={() => alert("Just enter a new username above to sign up!")} className="text-gek-500 font-semibold cursor-pointer ml-1">Sign up</button></p>
            </div>

          </div>
        </main>
        
        {/* Footer (Desktop) */}
        <footer className="hidden md:block mt-8 pb-4 text-center w-full">
           <div className="flex justify-center gap-4 text-xs text-gray-500 flex-wrap px-4 mb-2">
              <span className="cursor-pointer hover:underline">About</span>
              <span className="cursor-pointer hover:underline">Blog</span>
              <span className="cursor-pointer hover:underline">Jobs</span>
              <span className="cursor-pointer hover:underline">Help</span>
              <span className="cursor-pointer hover:underline">API</span>
              <span className="cursor-pointer hover:underline">Privacy</span>
              <span className="cursor-pointer hover:underline">Terms</span>
           </div>
           <div className="text-xs text-gray-500">
              © 2025 Gek from GekVibe
           </div>
        </footer>
      </div>
    );
  }

  // --- MAIN APP VIEW ---
  return (
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row">
      
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col w-[245px] h-screen border-r border-gray-200 fixed left-0 top-0 p-4 z-20 bg-white">
        <div className="mb-8 px-2">
           <h1 className="text-2xl font-bold text-black cursor-pointer tracking-tight" onClick={() => setView(View.FEED)}>Gek</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<HomeIcon active={view === View.FEED} />} label="Home" active={view === View.FEED} onClick={() => setView(View.FEED)} />
          <NavItem icon={<SearchIcon active={view === View.SEARCH} />} label="Search" active={view === View.SEARCH} onClick={() => setView(View.SEARCH)} />
          <NavItem icon={<PlusSquareIcon />} label="Create" onClick={() => setIsUploadOpen(true)} />
          <NavItem 
            icon={<HeartIcon filled={view === View.NOTIFICATIONS} />} 
            label="Notifications" 
            active={view === View.NOTIFICATIONS} 
            onClick={() => setView(View.NOTIFICATIONS)} 
          />
          <NavItem 
            icon={<img src={currentUser.avatar} className="w-6 h-6 rounded-full border border-gray-200 object-cover" />} 
            label="Profile" 
            active={view === View.PROFILE && isOwnProfile} 
            onClick={() => handleGoToProfile(currentUser)} 
          />
          <NavItem 
            icon={<LogOutIcon />} 
            label="Log out" 
            onClick={handleLogout} 
          />
        </nav>
        <div className="px-4 py-6 mt-auto">
            <div className="flex items-center gap-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M14.83 14.83a4 4 0 1 1 0-5.66"></path>
                </svg>
                <span className="text-sm font-semibold tracking-wide">from GekVibe</span>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[245px] min-h-screen w-full">
        <div className="max-w-4xl mx-auto pt-4 md:pt-8 px-0 md:px-4">
          
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md z-30 border-b border-gray-200 flex justify-between items-center p-4">
             <h1 className="text-xl font-bold text-black" onClick={() => setView(View.FEED)}>Gek</h1>
             <div className="flex gap-4">
                <button onClick={() => setView(View.NOTIFICATIONS)}>
                  <HeartIcon filled={view === View.NOTIFICATIONS} />
                </button>
             </div>
          </div>

          {view === View.FEED && (
            <div className="flex flex-col gap-2 pb-20">
               {posts.map(post => (
                 <PostCard 
                  key={post.id} 
                  post={post} 
                  onLike={handleLikePost}
                  onComment={handleComment} 
                  onShare={handleSharePost}
                  onUserClick={handleGoToProfile}
                 />
               ))}
               
               {posts.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <div className="mb-4 text-gray-300">
                      <CameraIcon />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-black">Welcome to Gek!</h3>
                    <p className="text-center">Follow people or create your first post<br/>to get started.</p>
                    <button 
                      onClick={() => setIsUploadOpen(true)}
                      className="mt-6 text-gek-600 font-semibold hover:text-gek-500"
                    >
                      Create Post
                    </button>
                 </div>
               )}
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
                        <SearchIcon />
                    </div>
                    <input 
                        type="search" 
                        className="block w-full p-4 pl-10 text-sm bg-gray-100 border border-gray-200 rounded-lg placeholder-gray-500 text-black focus:border-gek-500 outline-none" 
                        placeholder="Search users..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="mt-6 space-y-6">
                    {/* Users Section */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            {searchQuery ? 'Users' : 'Registered Users'}
                        </h3>
                        <div className="space-y-3">
                            {filteredUsers.map(user => (
                                <div 
                                  key={user.id} 
                                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                  onClick={() => handleGoToProfile(user)}
                                >
                                    <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{user.username}</span>
                                        <span className="text-gray-500 text-xs">{user.fullName}</span>
                                    </div>
                                    {user.id === currentUser.id && (
                                      <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">You</span>
                                    )}
                                </div>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-8 text-gray-400">
                                   <p className="text-sm italic mb-2">No users found.</p>
                                   <p className="text-xs">Log out and create a new account to see more people here!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          )}

          {view === View.NOTIFICATIONS && (
            <NotificationsView notifications={notifications} />
          )}
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-14 z-30">
        <button onClick={() => setView(View.FEED)}><HomeIcon active={view === View.FEED} /></button>
        <button onClick={() => setView(View.SEARCH)}><SearchIcon active={view === View.SEARCH} /></button>
        <button onClick={() => setIsUploadOpen(true)}><PlusSquareIcon /></button>
        <button onClick={() => setView(View.NOTIFICATIONS)}><HeartIcon filled={view === View.NOTIFICATIONS} /></button>
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