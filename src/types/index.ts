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

