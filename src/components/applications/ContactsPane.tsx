"use client";

import { useState } from "react";

interface Contact {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

interface ContactsPaneProps {
  opportunityId: string;
  contacts: Contact[];
  onUpdated: () => void;
}

export function ContactsPane({ opportunityId, contacts, onUpdated }: ContactsPaneProps) {
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    const res = await fetch(`/api/opportunities/${opportunityId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formName.trim(),
        role: formRole.trim() || null,
        email: formEmail.trim() || null,
        phone: formPhone.trim() || null,
        notes: formNotes.trim() || null,
      }),
    });
    if (!res.ok) return;
    setFormName("");
    setFormRole("");
    setFormEmail("");
    setFormPhone("");
    setFormNotes("");
    setShowForm(false);
    onUpdated();
  }

  async function handleDelete(contactId: string) {
    const res = await fetch(
      `/api/opportunities/${opportunityId}/contacts?id=${contactId}`,
      { method: "DELETE" }
    );
    if (!res.ok) return;
    onUpdated();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-card-foreground">Contacts</span>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add contact
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
          <input
            type="text"
            placeholder="Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
          />
          <input
            type="text"
            placeholder="Role (e.g. HR, Hiring Manager)"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
          />
          <textarea
            placeholder="Notes"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            rows={2}
            className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {contacts.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">No contacts yet</p>
      )}

      <ul className="space-y-2">
        {contacts.map((c) => (
          <li
            key={c.id}
            className="flex items-start justify-between gap-2 rounded border border-border bg-card p-2 text-sm"
          >
            <div>
              <p className="font-medium text-card-foreground">{c.name}</p>
              {c.role && <p className="text-xs text-muted-foreground">{c.role}</p>}
              {c.email && (
                <a href={`mailto:${c.email}`} className="text-xs text-primary hover:underline">
                  {c.email}
                </a>
              )}
              {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
              {c.notes && <p className="mt-1 text-xs text-muted-foreground">{c.notes}</p>}
            </div>
            <button
              type="button"
              onClick={() => handleDelete(c.id)}
              className="shrink-0 rounded border border-red-300 px-1.5 py-0.5 text-xs text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
