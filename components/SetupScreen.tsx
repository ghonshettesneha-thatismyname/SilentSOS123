"use client";

import { useState } from "react";
import { UserProfile, TrustedContact } from "@/lib/types";
import { createEmptyContact } from "@/lib/storage";
import { ShieldAlert, Plus, Trash2, User, Phone, ChevronRight } from "lucide-react";

interface SetupScreenProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export default function SetupScreen({ onComplete, initialProfile }: SetupScreenProps) {
  const [name, setName] = useState(initialProfile?.name || "");
  const [gender, setGender] = useState<"male" | "female">(initialProfile?.gender || "female");
  const [contacts, setContacts] = useState<TrustedContact[]>(
    initialProfile?.contacts?.length ? initialProfile.contacts : [createEmptyContact()]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addContact = () => {
    setContacts([...contacts, createEmptyContact()]);
  };

  const removeContact = (id: string) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((c) => c.id !== id));
    }
  };

  const updateContact = (id: string, field: "name" | "phone", value: string) => {
    setContacts(
      contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
    // Clear error when user starts typing
    if (errors[`contact_${id}_${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`contact_${id}_${field}`];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    contacts.forEach((contact) => {
      if (!contact.name.trim()) {
        newErrors[`contact_${contact.id}_name`] = "Contact name required";
      }
      if (!contact.phone.trim()) {
        newErrors[`contact_${contact.id}_phone`] = "Phone number required";
      } else if (!/^[+]?[\d\s-]{10,}$/.test(contact.phone.replace(/\s/g, ""))) {
        newErrors[`contact_${contact.id}_phone`] = "Invalid phone number";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onComplete({
        name: name.trim(),
        gender,
        contacts: contacts.map((c) => ({
          ...c,
          name: c.name.trim(),
          phone: c.phone.trim(),
        })),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      {/* Header */}
      <header className="text-center py-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ShieldAlert className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">SilentSOS</h1>
        </div>
        <p className="text-muted-foreground text-sm">Setup your emergency profile</p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
        {/* Name Input */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Your Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="Enter your name"
              className="w-full bg-card border border-border rounded-xl py-3 px-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {errors.name && <p className="text-primary text-xs">{errors.name}</p>}
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Gender</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGender("female")}
              className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                gender === "female"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              Female
            </button>
            <button
              type="button"
              onClick={() => setGender("male")}
              className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                gender === "male"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              Male
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            This helps route alerts to appropriate authorities
          </p>
        </div>

        {/* Trusted Contacts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Trusted Contacts
            </label>
            <button
              type="button"
              onClick={addContact}
              className="flex items-center gap-1 text-primary text-sm font-medium hover:text-primary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>

          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    Contact {index + 1}
                  </span>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(contact.id)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                      placeholder="Contact name"
                      className="w-full bg-secondary border border-border rounded-lg py-2.5 px-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {errors[`contact_${contact.id}_name`] && (
                    <p className="text-primary text-xs">
                      {errors[`contact_${contact.id}_name`]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                      placeholder="Phone number"
                      className="w-full bg-secondary border border-border rounded-lg py-2.5 px-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {errors[`contact_${contact.id}_phone`] && (
                    <p className="text-primary text-xs">
                      {errors[`contact_${contact.id}_phone`]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-auto flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Continue to Home
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
