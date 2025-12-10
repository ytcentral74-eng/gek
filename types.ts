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

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  user: User; // Embedded user for simpler mock logic
  imageUrl: string;
  caption: string;
  location?: string;
  likes: number;
  comments: Comment[];
  timestamp: number;
  likedByCurrentUser?: boolean;
}

export enum View {
  LOGIN = 'LOGIN',
  FEED = 'FEED',
  PROFILE = 'PROFILE',
  SEARCH = 'SEARCH'
}