"use client";

import { UserProfile } from "@/lib/types";
import { ShieldAlert, Settings, Users, AlertTriangle } from "lucide-react";

interface HomeScreenProps {
  profile: UserProfile;
  onTriggerEmergency: () => void;
  onEditProfile: () => void;
}

export default function HomeScreen({
  profile,
  onTriggerEmergency,
  onEditProfile,
}: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">SilentSOS</span>
        </div>
        <button
          onClick={onEditProfile}
          className="p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Welcome Message */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
        </div>

        {/* Emergency Button */}
        <button
          onClick={onTriggerEmergency}
          className="relative w-64 h-64 rounded-full bg-primary flex flex-col items-center justify-center gap-3 animate-pulse-emergency transition-transform hover:scale-105 active:scale-95"
          aria-label="Trigger emergency alert"
        >
          <AlertTriangle className="w-16 h-16 text-primary-foreground" />
          <span className="text-primary-foreground font-bold text-xl text-center px-4 text-balance">
            I NEED HELP
          </span>
        </button>

        {/* Instructions */}
        <div className="text-center max-w-xs">
          <p className="text-muted-foreground text-sm">
            Tap the button to record a 5-second audio message and send your location to trusted contacts
          </p>
        </div>

        {/* Contacts Preview */}
        <div className="w-full max-w-sm bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Trusted Contacts ({profile.contacts.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.contacts.map((contact) => (
              <span
                key={contact.id}
                className="bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded-full"
              >
                {contact.name}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-muted-foreground text-xs">
          Your safety is our priority
        </p>
      </footer>
    </div>
  );
}
