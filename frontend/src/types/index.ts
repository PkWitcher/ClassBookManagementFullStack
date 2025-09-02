// src/types/index.ts

export type User = {
  id: string;
  email: string;
  role: 'user' | 'Admin';
};

export type Class = {
  id: string;
  name: string;
  description: string;
};

export type Session = {
  id: string;
  classId: string;
  class: Class; // populated with class details
  dateTime: string; // ISO string
  capacity: number;
  bookedSeats: number;
};

export type Booking = {
  id: string;
  sessionId: string;
  userId: string;
  session: Session;
};
