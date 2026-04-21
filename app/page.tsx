"use client";

import { useState, useEffect } from "react";
import { Screen, UserProfile, AlertData } from "@/lib/types";
import { saveProfile, loadProfile } from "@/lib/storage";
import SetupScreen from "@/components/SetupScreen";
import HomeScreen from "@/components/HomeScreen";
import RecordingScreen from "@/components/RecordingScreen";
import AlertScreen from "@/components/AlertScreen";
import RoutingScreen from "@/components/RoutingScreen";

export default function SilentSOSApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("setup");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentAlert, setCurrentAlert] = useState<AlertData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = loadProfile();
    if (savedProfile) {
      setProfile(savedProfile);
      setCurrentScreen("home");
    }
    setIsLoading(false);
  }, []);

  const handleSetupComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
    setCurrentScreen("home");
  };

  const handleEditProfile = () => {
    setCurrentScreen("setup");
  };

  const handleTriggerEmergency = () => {
    setCurrentScreen("recording");
  };

  const handleRecordingComplete = (alert: AlertData) => {
    setCurrentAlert(alert);
    setCurrentScreen("alert");
  };

  const handleRecordingCancel = () => {
    setCurrentScreen("home");
  };

  const handleAlertContinue = () => {
    setCurrentScreen("routing");
  };

  const handleRoutingBack = () => {
    setCurrentScreen("alert");
  };

  const handleRoutingDone = () => {
    // Clean up audio URL to prevent memory leaks
    if (currentAlert?.audioUrl) {
      URL.revokeObjectURL(currentAlert.audioUrl);
    }
    setCurrentAlert(null);
    setCurrentScreen("home");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading SilentSOS...</p>
        </div>
      </div>
    );
  }

  // Render current screen
  return (
    <>
      {currentScreen === "setup" && (
        <SetupScreen
          onComplete={handleSetupComplete}
          initialProfile={profile}
        />
      )}

      {currentScreen === "home" && profile && (
        <HomeScreen
          profile={profile}
          onTriggerEmergency={handleTriggerEmergency}
          onEditProfile={handleEditProfile}
        />
      )}

      {currentScreen === "recording" && (
        <RecordingScreen
          onComplete={handleRecordingComplete}
          onCancel={handleRecordingCancel}
        />
      )}

      {currentScreen === "alert" && currentAlert && (
        <AlertScreen
          alert={currentAlert}
          onContinue={handleAlertContinue}
        />
      )}

      {currentScreen === "routing" && profile && currentAlert && (
        <RoutingScreen
          profile={profile}
          alert={currentAlert}
          onBack={handleRoutingBack}
          onDone={handleRoutingDone}
        />
      )}
    </>
  );
}
