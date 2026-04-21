"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AlertData } from "@/lib/types";
import { Mic, MapPin, XCircle } from "lucide-react";

interface RecordingScreenProps {
  onComplete: (alert: AlertData) => void;
  onCancel: () => void;
}

export default function RecordingScreen({
  onComplete,
  onCancel,
}: RecordingScreenProps) {
  const [countdown, setCountdown] = useState(5);
  const [status, setStatus] = useState<"requesting" | "recording" | "processing" | "error">("requesting");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  }, []);

  const handleComplete = useCallback((audioBlob: Blob | null, audioUrl: string | null) => {
    const alertData: AlertData = {
      id: `alert_${Date.now()}`,
      timestamp: new Date(),
      location,
      audioBlob,
      audioUrl,
      status: "ready",
    };
    onComplete(alertData);
  }, [location, onComplete]);

  // Get location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.warn("Location error:", error.message);
          // Continue without location
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Request microphone and start recording
  useEffect(() => {
    let isMounted = true;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);
          handleComplete(audioBlob, audioUrl);
        };

        mediaRecorder.start();
        setStatus("recording");
      } catch (error) {
        if (!isMounted) return;
        setStatus("error");
        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            setErrorMessage("Microphone access denied. Please enable microphone permissions.");
          } else {
            setErrorMessage("Could not access microphone. Please try again.");
          }
        }
      }
    };

    startRecording();

    return () => {
      isMounted = false;
      stopRecording();
    };
  }, [handleComplete, stopRecording]);

  // Countdown timer
  useEffect(() => {
    if (status !== "recording") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("processing");
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, stopRecording]);

  const handleCancel = () => {
    stopRecording();
    onCancel();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Cancel Button */}
      <button
        onClick={handleCancel}
        className="absolute top-4 right-4 p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
        aria-label="Cancel recording"
      >
        <XCircle className="w-6 h-6 text-foreground" />
      </button>

      {status === "requesting" && (
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 mx-auto">
            <Mic className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Requesting Access</h2>
          <p className="text-muted-foreground text-sm">
            Please allow microphone access to record your message
          </p>
        </div>
      )}

      {status === "recording" && (
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-40 h-40 rounded-full bg-primary flex items-center justify-center animate-recording">
              <span className="text-6xl font-bold text-primary-foreground">{countdown}</span>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <span className="text-lg font-semibold text-primary">Recording</span>
          </div>
          
          <p className="text-muted-foreground text-sm mb-6">
            Speak clearly - your message is being recorded
          </p>

          {location && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span>Location captured</span>
            </div>
          )}
        </div>
      )}

      {status === "processing" && (
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 mx-auto animate-pulse">
            <Mic className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Processing</h2>
          <p className="text-muted-foreground text-sm">
            Preparing your emergency alert...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 mx-auto">
            <XCircle className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground text-sm mb-6">{errorMessage}</p>
          <button
            onClick={handleCancel}
            className="bg-card border border-border text-foreground font-medium py-3 px-6 rounded-xl hover:bg-secondary transition-colors"
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}
