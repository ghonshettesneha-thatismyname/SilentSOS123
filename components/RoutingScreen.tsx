"use client";

import { useState } from "react";
import { UserProfile, AlertData } from "@/lib/types";
import {
  Users,
  Shield,
  Globe,
  Phone,
  Share2,
  Check,
  ChevronRight,
  ArrowLeft,
  Download,
  AlertTriangle,
} from "lucide-react";

interface RoutingScreenProps {
  profile: UserProfile;
  alert: AlertData;
  onBack: () => void;
  onDone: () => void;
}

interface ActionStatus {
  contacts: boolean;
  authorities: boolean;
  public: boolean;
}

export default function RoutingScreen({
  profile,
  alert,
  onBack,
  onDone,
}: RoutingScreenProps) {
  const [actionStatus, setActionStatus] = useState<ActionStatus>({
    contacts: false,
    authorities: false,
    public: false,
  });
  const [showReport, setShowReport] = useState(false);

  // Get authorities based on gender
  const getAuthorities = () => {
    if (profile.gender === "female") {
      return [
        { name: "Women Helpline", number: "1091", priority: 1 },
        { name: "Police", number: "100", priority: 2 },
        { name: "Emergency Services", number: "112", priority: 3 },
      ];
    }
    return [
      { name: "Police", number: "100", priority: 1 },
      { name: "Emergency Services", number: "112", priority: 2 },
      { name: "Ambulance", number: "102", priority: 3 },
    ];
  };

  const authorities = getAuthorities();

  const simulateSendToContacts = () => {
    // Simulate sending alert to trusted contacts
    setActionStatus((prev) => ({ ...prev, contacts: true }));
  };

  const simulateEscalateToAuthorities = () => {
    // Simulate escalating to authorities
    setActionStatus((prev) => ({ ...prev, authorities: true }));
  };

  const enablePublicAlert = () => {
    // Simulate enabling public alert mode
    setActionStatus((prev) => ({ ...prev, public: true }));
  };

  const handleShare = async () => {
    const shareText = `EMERGENCY ALERT from ${profile.name}
Time: ${alert.timestamp.toLocaleString()}
${
  alert.location
    ? `Location: https://maps.google.com/?q=${alert.location.latitude},${alert.location.longitude}`
    : "Location: Not available"
}
Please respond immediately!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "SilentSOS Emergency Alert",
          text: shareText,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert("Alert copied to clipboard!");
    }
  };

  const generateReport = () => {
    const report = {
      alertId: alert.id,
      userName: profile.name,
      userGender: profile.gender,
      timestamp: alert.timestamp.toISOString(),
      location: alert.location,
      trustedContacts: profile.contacts,
      actionsTaken: actionStatus,
      authoritiesContacted: actionStatus.authorities ? authorities : [],
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `silentsos-report-${alert.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Alert Routing</h1>
          <p className="text-muted-foreground text-sm">Send your alert</p>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 max-w-md mx-auto w-full overflow-y-auto">
        {/* Priority Order Info */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            Smart Alert Routing
          </h2>
          <p className="text-muted-foreground text-sm">
            Alerts are sent in priority order: Trusted Contacts first, then Authorities based on your profile.
          </p>
        </div>

        {/* Trusted Contacts Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Priority 1: Trusted Contacts
          </h2>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {profile.contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-secondary text-foreground text-sm px-3 py-2 rounded-lg"
                >
                  <span className="font-medium">{contact.name}</span>
                  <span className="text-muted-foreground ml-2">{contact.phone}</span>
                </div>
              ))}
            </div>
            <button
              onClick={simulateSendToContacts}
              disabled={actionStatus.contacts}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                actionStatus.contacts
                  ? "bg-green-900/30 text-green-400 border border-green-800"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {actionStatus.contacts ? (
                <>
                  <Check className="w-5 h-5" />
                  Alert Sent to Contacts
                </>
              ) : (
                <>
                  Send Alert to Contacts
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Authorities Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Priority 2: Authorities
            <span className="text-xs text-muted-foreground font-normal">
              (Based on {profile.gender === "female" ? "Female" : "Male"} profile)
            </span>
          </h2>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="space-y-2">
              {authorities.map((authority) => (
                <div
                  key={authority.number}
                  className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3"
                >
                  <div>
                    <span className="text-foreground font-medium block">{authority.name}</span>
                    <span className="text-muted-foreground text-sm">{authority.number}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Priority {authority.priority}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={simulateEscalateToAuthorities}
              disabled={actionStatus.authorities}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                actionStatus.authorities
                  ? "bg-green-900/30 text-green-400 border border-green-800"
                  : "bg-card border-2 border-primary text-primary hover:bg-primary/10"
              }`}
            >
              {actionStatus.authorities ? (
                <>
                  <Check className="w-5 h-5" />
                  Escalated to Authorities
                </>
              ) : (
                <>
                  Escalate to Authorities
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Public Alert Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Optional: Public Alert Mode
          </h2>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-muted-foreground text-sm">
              Enable public alert to broadcast your location for nearby help. Your location will be visible to anyone nearby.
            </p>
            <button
              onClick={enablePublicAlert}
              disabled={actionStatus.public}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                actionStatus.public
                  ? "bg-green-900/30 text-green-400 border border-green-800"
                  : "bg-secondary text-foreground hover:bg-muted"
              }`}
            >
              {actionStatus.public ? (
                <>
                  <Check className="w-5 h-5" />
                  Public Alert Enabled
                </>
              ) : (
                <>
                  Enable Public Alert
                  <Globe className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:112"
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call 112
            </a>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-card border border-border text-foreground py-3 rounded-xl font-medium hover:bg-secondary transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share Alert
            </button>
          </div>
        </section>

        {/* Report Section */}
        <section className="space-y-3">
          <button
            onClick={() => setShowReport(!showReport)}
            className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:bg-secondary transition-colors"
          >
            <span className="font-medium text-foreground">Download Report</span>
            <Download className="w-5 h-5 text-muted-foreground" />
          </button>
          {showReport && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-muted-foreground text-sm">
                Download a summary of this emergency alert including your information, location, and actions taken.
              </p>
              <button
                onClick={generateReport}
                className="w-full bg-secondary text-foreground py-3 rounded-xl font-medium hover:bg-muted transition-colors"
              >
                Download JSON Report
              </button>
            </div>
          )}
        </section>

        {/* Done Button */}
        <button
          onClick={onDone}
          className="w-full bg-card border border-border text-foreground font-semibold py-4 rounded-xl hover:bg-secondary transition-colors"
        >
          Return to Home
        </button>
      </main>
    </div>
  );
}
