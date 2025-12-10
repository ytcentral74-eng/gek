import React from 'react';
import { Notification } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications }) => {
  
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "w";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  return (
    <div className="max-w-md mx-auto pt-4 pb-20 px-4">
       <h2 className="text-xl font-bold mb-6">Notifications</h2>
       
       <div className="space-y-4">
         {notifications.length === 0 ? (
           <div className="text-center py-20 text-gray-500">
             <div className="flex justify-center mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
             </div>
             <p>Activity on your posts will appear here.</p>
           </div>
         ) : (
           notifications.map((notif) => (
             <div key={notif.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                   <img 
                     src={notif.user.avatar} 
                     alt={notif.user.username} 
                     className="w-10 h-10 rounded-full border border-gray-200 object-cover flex-shrink-0" 
                   />
                   <div className="text-sm">
                      <span className="font-semibold mr-1">{notif.user.username}</span>
                      <span>
                        {notif.type === 'LIKE' && 'liked your post.'}
                        {notif.type === 'COMMENT' && `commented: "${notif.text}"`}
                        {notif.type === 'SHARE' && 'shared your post.'}
                      </span>
                      <span className="text-gray-400 ml-2 text-xs">{timeAgo(notif.timestamp)}</span>
                   </div>
                </div>
                {notif.postImage && (
                  <img 
                    src={notif.postImage} 
                    alt="post thumbnail" 
                    className="w-10 h-10 object-cover rounded" 
                  />
                )}
             </div>
           ))
         )}
       </div>
    </div>
  );
};

export default NotificationsView;