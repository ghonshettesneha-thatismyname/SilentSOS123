import { UserProfile, TrustedContact } from "./types";

const STORAGE_KEY = "silentsos_profile";

export function saveProfile(profile: UserProfile): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
}

export function loadProfile(): UserProfile | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as UserProfile;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearProfile(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function generateContactId(): string {
  return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createEmptyContact(): TrustedContact {
  return {
    id: generateContactId(),
    name: "",
    phone: "",
  };
}
