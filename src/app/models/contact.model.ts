/**
 * Domain models for the Contact Management Dashboard.
 * These interfaces define the shape of data returned by the API (or mock fallback).
 */

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  jobTitle: string;
  bio: string;
  phone: string[];
  address: string;
  dial: string;
  meeting: string;
  social: Record<string, string>;
  status: 'online' | 'away';
  createdAt: string;
}

export interface EmailAddress {
  id: string;
  contactId: string;
  email: string;
  isPrimary: boolean;
}
