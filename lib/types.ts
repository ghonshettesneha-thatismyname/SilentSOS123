export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
}

export interface UserProfile {
  name: string;
  gender: "male" | "female";
  contacts: TrustedContact[];
}

export interface AlertData {
  id: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  audioBlob: Blob | null;
  audioUrl: string | null;
  status: "recording" | "ready" | "sent";
}

export type Screen = "setup" | "home" | "recording" | "alert" | "routing";
