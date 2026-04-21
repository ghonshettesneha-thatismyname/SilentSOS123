"use client";

import { AlertData } from "@/lib/types";
import { MapPin, Clock, Play, Pause, AlertTriangle, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface AlertScreenProps {
  alert: AlertData;
  onContinue: () => void;
}

export default function AlertScreen({ alert, onContinue }: AlertScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (alert.audioUrl) {
      audioRef.current = new Audio(alert.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [alert.audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
      <header className="text-center py-6">
        <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-4">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">Emergency Alert Generated</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Alert Ready</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review your alert before sending
        </p>
      </header>

      {/* Alert Card */}
      <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
        {/* Status Badge */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="inline-flex items-center gap-1.5 bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Ready to Send
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <span className="text-sm text-muted-foreground block">Timestamp</span>
              <span className="text-foreground font-medium">{formatTime(alert.timestamp)}</span>
              <span className="text-muted-foreground text-sm block">{formatDate(alert.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-muted-foreground block">Location</span>
              {alert.location ? (
                <>
                  <span className="text-foreground font-medium block">
                    {alert.location.latitude.toFixed(6)}, {alert.location.longitude.toFixed(6)}
                  </span>
                  {alert.location.accuracy && (
                    <span className="text-muted-foreground text-sm">
                      Accuracy: {Math.round(alert.location.accuracy)}m
                    </span>
                  )}
                  <a
                    href={`https://maps.google.com/?q=${alert.location.latitude},${alert.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline block mt-1"
                  >
                    View on Google Maps
                  </a>
                </>
              ) : (
                <span className="text-muted-foreground">Location not available</span>
              )}
            </div>
          </div>
        </div>

        {/* Audio Recording */}
        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-sm text-muted-foreground block mb-3">Audio Recording</span>
          {alert.audioUrl ? (
            <button
              onClick={togglePlayback}
              className="w-full flex items-center justify-center gap-3 bg-secondary hover:bg-secondary/80 transition-colors rounded-lg py-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                )}
              </div>
              <span className="text-foreground font-medium">
                {isPlaying ? "Pause Recording" : "Play Recording"}
              </span>
            </button>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No audio recorded
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="mt-auto flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Continue to Send Alert
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
