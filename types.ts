export interface User {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  banner: string;
  bio: string;
  followers: number;
  following: number;
}

export interface Post {
  id: string;
  userId: string;
  user: User; // Embedded user for simpler mock logic
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: number;
  likedByCurrentUser?: boolean;
}

export enum View {
  LOGIN = 'LOGIN',
  FEED = 'FEED',
  PROFILE = 'PROFILE',
  SEARCH = 'SEARCH'
}