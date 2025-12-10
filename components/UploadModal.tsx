import React, { useState, useRef, useEffect } from 'react';
import { User, Post } from '../types';
import { generateImageCaption, searchPlaces } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface UploadModalProps {
  user: User;
  onClose: () => void;
  onUpload: (post: Post) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ user, onClose, onUpload }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [step, setStep] = useState<'SELECT' | 'EDIT'>('SELECT');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location Search State
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<string[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (locationQuery.length > 2) {
        setIsSearchingPlaces(true);
        const results = await searchPlaces(locationQuery);
        setLocationResults(results);
        setIsSearchingPlaces(false);
      } else {
        setLocationResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [locationQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setStep('EDIT');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCaption = async () => {
    if (!selectedImage) return;
    
    setIsGenerating(true);
    // Remove data:image/jpeg;base64, prefix for API
    const base64Data = selectedImage.split(',')[1];
    
    const generatedCaption = await generateImageCaption(base64Data, caption);
    setCaption(generatedCaption);
    setIsGenerating(false);
  };

  const handlePost = () => {
    if (!selectedImage) return;

    const newPost: Post = {
      id: Date.now().toString(),
      userId: user.id,
      user: user,
      imageUrl: selectedImage,
      caption: caption,
      location: location || undefined,
      likes: 0,
      comments: [],
      timestamp: Date.now(),
      likedByCurrentUser: false
    };

    onUpload(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button onClick={step === 'SELECT' ? onClose : () => setStep('SELECT')} className="text-black font-medium text-sm">
             {step === 'SELECT' ? 'Cancel' : 'Back'}
          </button>
          <span className="font-semibold text-black">Create new post</span>
          {step === 'EDIT' ? (
            <button onClick={handlePost} className="text-gek-500 font-bold text-sm">
              Share
            </button>
          ) : (
            <div className="w-8"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row h-full md:min-h-[500px]">
          {step === 'SELECT' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <h3 className="text-xl font-light text-black">Drag photos here</h3>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gek-600 hover:bg-gek-500 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors"
              >
                Select from computer
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <>
              {/* Image Preview (Left) */}
              <div className="md:w-2/3 bg-gray-50 flex flex-col relative bg-black">
                <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                    <img src={selectedImage || ''} alt="Preview" className="max-w-full max-h-[500px] object-contain" />
                </div>
              </div>

              {/* Edit Details (Right) */}
              <div className="md:w-1/3 border-l border-gray-200 flex flex-col relative">
                <div className="p-4 flex items-center gap-3 border-b border-gray-200">
                  <img src={user.avatar} className="w-8 h-8 rounded-full" />
                  <span className="font-semibold text-sm text-black">{user.username}</span>
                </div>
                
                <div className="p-4 flex-1">
                  <textarea 
                    className="w-full bg-transparent resize-none outline-none text-sm min-h-[150px] text-black placeholder-gray-400"
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  
                  <div className="mt-4">
                     <button 
                      onClick={handleGenerateCaption}
                      disabled={isGenerating}
                      className="flex items-center gap-2 text-xs font-semibold bg-gek-50 text-gek-600 border border-gek-200 px-3 py-2 rounded-full hover:bg-gek-100 transition-colors disabled:opacity-50"
                     >
                       <SparklesIcon />
                       {isGenerating ? 'Thinking...' : 'Generate Caption with Gemini'}
                     </button>
                  </div>
                </div>

                {/* Location Section */}
                <div className="border-t border-gray-200">
                  {!isSearchingLocation ? (
                    <div 
                      className="p-4 flex justify-between items-center text-gray-500 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setIsSearchingLocation(true)}
                    >
                      <span className={`${location ? 'text-black' : ''}`}>{location || 'Add location'}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                  ) : (
                    <div className="p-2 relative">
                       <div className="flex items-center border-b border-gek-500 pb-1">
                          <input 
                            type="text"
                            autoFocus
                            placeholder="Find a location"
                            className="w-full p-2 text-sm outline-none"
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                          />
                          <button onClick={() => { setIsSearchingLocation(false); setLocationQuery(''); }} className="text-gray-400 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                       </div>
                       
                       {/* Search Results Dropdown */}
                       <div className="max-h-[200px] overflow-y-auto bg-white">
                          {isSearchingPlaces && (
                            <div className="p-3 text-xs text-gray-400">Searching...</div>
                          )}
                          {!isSearchingPlaces && locationResults.map((place, index) => (
                             <div 
                              key={index} 
                              className="p-3 text-sm hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-0"
                              onClick={() => {
                                setLocation(place);
                                setIsSearchingLocation(false);
                                setLocationQuery('');
                                setLocationResults([]);
                              }}
                             >
                               {place}
                             </div>
                          ))}
                          {!isSearchingPlaces && locationQuery.length > 2 && locationResults.length === 0 && (
                             <div className="p-3 text-xs text-gray-400">No locations found</div>
                          )}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;