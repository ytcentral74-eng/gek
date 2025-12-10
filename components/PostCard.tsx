import React, { useState } from 'react';
import { Post, User } from '../types';
import { HeartIcon, MessageCircleIcon } from './Icons';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onUserClick: (user: User) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onUserClick }) => {
  const [isLiked, setIsLiked] = useState(post.likedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(post.id);
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  return (
    <div className="w-full max-w-[470px] mx-auto border-b border-gray-200 pb-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <img 
            src={post.user.avatar} 
            alt={post.user.username} 
            className="w-8 h-8 rounded-full object-cover border border-gray-200 cursor-pointer"
            onClick={() => onUserClick(post.user)}
          />
          <span 
            className="font-semibold text-sm cursor-pointer hover:opacity-80"
            onClick={() => onUserClick(post.user)}
          >
            {post.user.username}
          </span>
          <span className="text-gray-500 text-xs">• {timeAgo(post.timestamp)}</span>
        </div>
        <button className="text-black">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </div>

      {/* Image */}
      <div className="w-full bg-gray-100 aspect-square overflow-hidden rounded-sm relative">
        <img 
          src={post.imageUrl} 
          alt="Post" 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="transition-transform active:scale-90">
            <HeartIcon filled={isLiked} />
          </button>
          <button className="transition-transform active:scale-90">
            <MessageCircleIcon />
          </button>
          <button className="transition-transform active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </button>
      </div>

      {/* Likes */}
      <div className="px-3">
        <span className="font-semibold text-sm">{likesCount.toLocaleString()} likes</span>
      </div>

      {/* Caption */}
      <div className="px-3 pt-2">
        <span 
          className="font-semibold text-sm mr-2 cursor-pointer hover:opacity-80"
          onClick={() => onUserClick(post.user)}
        >
          {post.user.username}
        </span>
        <span className="text-sm whitespace-pre-wrap">{post.caption}</span>
      </div>

      {/* Comments Link */}
      <div className="px-3 pt-1">
        <button className="text-gray-500 text-sm">View all {post.comments} comments</button>
      </div>
    </div>
  );
};

export default PostCard;