export interface UserSession {
  uid: string;
  email: string;
  name?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserSession;
  message?: string;
}
