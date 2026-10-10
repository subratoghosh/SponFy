"use client";

import React, { useState } from "react";
import { Company, Contact, ContactStatus } from "@/types";
import { UserCheck, Plus, ExternalLink, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { addContact } from "@/lib/data/repositories/sponsors";
import { useToast } from "@/components/ui/toast";

export const ContactsTab: React.FC<{ company: Company; onUpdate: () => void }> = ({
  company,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    role: "Developer Relations / Campus Lead",
    email: "",
    status: "verified" as ContactStatus,
    sourceUrl: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.email) return;

    try {
      await addContact(company.id, newContact);
      toast("Contact added to sponsor dossier", "success");
      setModalOpen(false);
      onUpdate();
    } catch {
      toast("Failed to add contact", "error");
    }
  };

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case "verified":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">Verified Public</span>;
      case "public":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">Public Page</span>;
      case "needs_verification":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Needs Verification</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800 border border-stone-300">Unknown</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-5 border border-green-dark/12 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-extrabold text-lg text-green-dark">
            Verified Partnership Contacts
          </h3>
          <p className="text-xs text-text-dim">
            Publicly cited sponsorship, DevRel, and university recruiters
          </p>
        </div>
        <Button
          variant="butter"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="text-xs font-bold shadow-md"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Contact Manually
        </Button>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(company.contacts || []).map((con) => (
          <div
            key={con.id}
            className="p-5 bg-white rounded-2xl border border-green-dark/12 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-butter-warm flex items-center justify-center text-green-dark font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-green-dark">
                      {con.name}
                    </h4>
                    <span className="text-xs text-text-dim block">
                      {con.role}
                    </span>
                  </div>
                </div>
                {getStatusBadge(con.status)}
              </div>

              <div className="p-3 bg-butter-panel rounded-xl text-xs space-y-1.5 border border-green-dark/8">
                <div className="flex items-center gap-2 font-mono text-green-dark font-bold">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  <span>{con.email}</span>
                </div>
                {con.sourceUrl && (
                  <div className="flex items-center gap-1 text-[11px] text-text-dim">
                    <span>Source:</span>
                    <a
                      href={con.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline truncate max-w-[200px]"
                    >
                      {con.sourceUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Sponsor Contact"
        description="Add a verified recruiter or DevRel manager for outreach."
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Full Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            required
          />
          <Input
            label="Role / Title"
            value={newContact.role}
            onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            required
          />
          <Select
            label="Verification Status"
            value={newContact.status}
            onChange={(e) => setNewContact({ ...newContact, status: e.target.value as ContactStatus })}
          >
            <option value="verified">Verified Public Source</option>
            <option value="public">Official Company Page</option>
            <option value="needs_verification">Needs Verification</option>
          </Select>
          <Input
            label="Source URL"
            value={newContact.sourceUrl}
            onChange={(e) => setNewContact({ ...newContact, sourceUrl: e.target.value })}
          />
          <div className="pt-4 border-t border-green-dark/10 flex justify-end gap-3">
            <Button type="button" variant="glass" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="butter" size="sm" className="font-bold">
              Save Contact
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
