export interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  phone: string;
}

export interface Pact {
  _id: string;
  title: string;
  description?: string;
  participants: Array<{ _id: string; name: string; email: string; phone: string }>;
  status: 'active' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  minDaysPerWeek: number;
  maxActivitiesPerUser: number;
  skipFine: number;
  leaveFine: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePactDto {
  title: string;
  description?: string;
  minDaysPerWeek: number;
  maxActivitiesPerUser: number;
  skipFine: number;
  leaveFine: number;
  startDate?: string;
  endDate?: string;
}

export interface Activity {
  _id: string;
  pactId: string;
  userId: string;
  name: string;
  description?: string;
  numberOfDays: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityDto {
  pactId: string;
  userId: string;
  name: string;
  description?: string;
  numberOfDays: number;
  isPrimary: boolean;
}

export interface ActivityLog {
  _id: string;
  pactId: string;
  userId: string;
  activityId: string;
  date: string; // ISO date string
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityLogDto {
  pactId: string;
  userId: string;
  activityId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  notes?: string;
}

export interface UserProgressResult {
  pactId: string;
  targetDays: number;
  activityDays: number;
}

export interface UserProgressResponse {
  userId: string;
  results: UserProgressResult[];
}

export interface UserLogsByPactDay {
  date: string; // YYYY-MM-DD
  logs: Array<{
    id: string;
    activityId: string;
    occurredAt: string;
    notes?: string;
    verified: boolean;
  }>;
}

export interface UserLogsByPactResponse {
  pactId: string;
  userId: string;
  days: UserLogsByPactDay[];
}

export interface ActivityLogImage {
  name: string;
  mimeType: string;
  sizeBytes: number;
  webViewLink: string;
  webContentLink: string;
}

export interface ActivityLogDetail {
  id: string;
  date: string; // YYYY-MM-DD
  occurredAt: string;
  notes?: string;
  images: ActivityLogImage[];
}

