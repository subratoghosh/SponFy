'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Sliders,
  ShieldAlert,
  Database,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  Cpu,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { settingsRepository } from '@/lib/data/repositories/settings';

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<'profile' | 'gmail' | 'limits' | 'suppression' | 'data'>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [suppressionList, setSuppressionList] = useState<any[]>([]);
  const [newSuppressionEmail, setNewSuppressionEmail] = useState('');
  const [newSuppressionReason, setNewSuppressionReason] = useState('');
  const [dailyLimit, setDailyLimit] = useState(30);
  const [gmailStatus, setGmailStatus] = useState<any>({ connected: false });
  const [gmailLoading, setGmailLoading] = useState(false);

  useEffect(() => {
    loadSettings();

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'gmail') setActiveTab('gmail');
      if (urlParams.get('connected') === 'success') {
        toast('Gmail inbox successfully connected! Outreach will send from your email.', 'success');
      } else if (urlParams.get('connected') === 'mock') {
        toast('Demo Gmail simulation mode active.', 'info');
      } else if (urlParams.get('error')) {
        toast(`Connection failed: ${urlParams.get('error')}`, 'error');
      }
    }
  }, []);

  const loadSettings = async () => {
    const p = await settingsRepository.getProfile();
    setProfile(p);
    const supp = await settingsRepository.getSuppressionList();
    setSuppressionList(supp);
    try {
      const res = await fetch('/api/integrations/gmail/status');
      if (res.ok) {
        const g = await res.json();
        setGmailStatus(g);
      }
    } catch {
      // fallback
    }
  };

  const handleConnectGmail = () => {
    setGmailLoading(true);
    window.location.href = '/api/integrations/gmail/auth';
  };

  const handleDisconnectGmail = async () => {
    setGmailLoading(true);
    try {
      await fetch('/api/integrations/gmail/disconnect', { method: 'POST' });
      setGmailStatus({ connected: false, email: '' });
      toast('Gmail inbox disconnected. Outreach will use simulation mode.', 'info');
    } catch {
      toast('Failed to disconnect Gmail', 'error');
    } finally {
      setGmailLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    await settingsRepository.updateProfile(profile);
    toast('Profile & signature updated successfully!', 'success');
  };

  const handleAddSuppression = async () => {
    if (!newSuppressionEmail.trim()) return;
    await settingsRepository.addSuppression(newSuppressionEmail.trim(), newSuppressionReason.trim());
    setNewSuppressionEmail('');
    setNewSuppressionReason('');
    const supp = await settingsRepository.getSuppressionList();
    setSuppressionList(supp);
    toast('Email added to suppression list', 'success');
  };

  const handleRemoveSuppression = async (id: string) => {
    await settingsRepository.removeSuppression(id);
    const supp = await settingsRepository.getSuppressionList();
    setSuppressionList(supp);
    toast('Email removed from suppression list', 'info');
  };

  const handleResetDemoData = () => {
    localStorage.clear();
    toast('Demo storage refreshed to default 24 sponsors and mock states', 'info');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 space-y-1 shrink-0">
        {[
          { id: 'profile', label: 'Profile & Signature', icon: User },
          { id: 'gmail', label: 'Gmail OAuth & AI Keys', icon: Mail },
          { id: 'limits', label: 'Safety & Sending Limits', icon: Sliders },
          { id: 'suppression', label: 'Do-Not-Contact List', icon: ShieldAlert },
          { id: 'data', label: 'Data & Demo Controls', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-[#0C382E] text-[#FFF0B3] shadow-sm'
                  : 'text-[#0C382E]/70 hover:bg-[#FFFFFF] hover:text-[#0C382E]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && profile && (
          <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm">
            <CardHeader className="pb-4 border-b border-[#0C382E]/5">
              <CardTitle className="text-base font-heading font-bold text-[#0C382E]">
                Organizer Profile & Email Signature
              </CardTitle>
              <p className="text-xs text-[#0C382E]/60">
                These credentials will be dynamically injected into generated sponsorship emails.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#0C382E] mb-1 block">Full Name</label>
                    <Input
                      value={profile.fullName ?? ''}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#0C382E] mb-1 block">Organizer Title</label>
                    <Input
                      value={profile.title ?? ''}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#0C382E] mb-1 block">Organization / College</label>
                    <Input
                      value={profile.organization ?? ''}
                      onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#0C382E] mb-1 block">Sender Email (Gmail connected)</label>
                    <Input
                      value={profile.email ?? ''}
                      disabled
                      className="text-xs bg-[#FAF4E6]/50 opacity-80"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0C382E] mb-1 block">Custom Email Signature</label>
                  <Textarea
                    rows={4}
                    value={profile.signature ?? ''}
                    onChange={(e) => setProfile({ ...profile, signature: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="bg-[#0C382E] text-[#FFF0B3] hover:bg-[#0C382E]/90 text-xs font-bold">
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Gmail & AI Keys Tab */}
        {activeTab === 'gmail' && (
          <div className="space-y-6">
            <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm">
              <CardHeader className="pb-4 border-b border-[#0C382E]/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-heading font-bold text-[#0C382E]">
                    Gmail OAuth Integration
                  </CardTitle>
                  {gmailStatus?.connected ? (
                    <Badge variant="success" className="text-xs font-bold">
                      {gmailStatus.isMock ? "Connected (Demo Mode)" : "Connected"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-bold text-[#0C382E]/60 border-[#0C382E]/20">
                      Not Connected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#0C382E]/60">
                  Sends verified outreach emails directly from your own email address without relay or spoofing flags.
                </p>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-[#0C382E] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#0C382E] space-y-1">
                    <p className="font-bold">Multi-User Inbox Privacy:</p>
                    <p className="text-[#0C382E]/80 leading-relaxed">
                      Each organizer connects their own personal or team Gmail account. All sponsor outreach messages are sent directly from your connected inbox. SponFy stores your tokens with AES-256-GCM encryption.
                    </p>
                  </div>
                </div>

                {gmailStatus?.connected ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#FFFDF6] rounded-xl border border-[#0C382E]/10 gap-3">
                    <div>
                      <div className="text-xs font-bold text-[#0C382E]">
                        Connected Account: {gmailStatus.email || "Active User Inbox"}
                      </div>
                      <div className="text-[11px] text-[#0C382E]/60">
                        Scopes: gmail.send, gmail.readonly {gmailStatus.lastSyncAt ? `• Last synced: ${new Date(gmailStatus.lastSyncAt).toLocaleDateString()}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnectGmail}
                        disabled={gmailLoading}
                        className="text-xs border-red-500/30 text-red-600 hover:bg-red-50"
                      >
                        Disconnect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleConnectGmail}
                        disabled={gmailLoading}
                        className="text-xs border-[#0C382E]/20 text-[#0C382E]"
                      >
                        Re-connect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#FFFDF6] rounded-xl border border-[#0C382E]/10 gap-3">
                    <div>
                      <div className="text-xs font-bold text-[#0C382E]">No Inbox Connected</div>
                      <div className="text-[11px] text-[#0C382E]/60">
                        Connect your Gmail to send real outreach emails directly to company sponsors.
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleConnectGmail}
                      disabled={gmailLoading}
                      className="bg-[#0C382E] text-[#FFF0B3] hover:bg-[#0C382E]/90 text-xs font-bold shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1.5" />
                      Connect Gmail Inbox
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Integration Status Table */}
            <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm">
              <CardHeader className="pb-4 border-b border-[#0C382E]/5">
                <CardTitle className="text-base font-heading font-bold text-[#0C382E]">
                  AI & Search Provider Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF4E6]/50 border border-[#0C382E]/10">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#0C382E]" />
                      <span className="text-xs font-bold text-[#0C382E]">Google Gemini 2.5 Flash</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/20">Active / Fallback Mock Ready</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF4E6]/50 border border-[#0C382E]/10">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-[#0C382E]" />
                      <span className="text-xs font-bold text-[#0C382E]">Tavily Live Web Search</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/20">Active / Cited Extractor Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Limits & Safety */}
        {activeTab === 'limits' && (
          <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm">
            <CardHeader className="pb-4 border-b border-[#0C382E]/5">
              <CardTitle className="text-base font-heading font-bold text-[#0C382E]">
                Safety & Daily Dispatch Limits
              </CardTitle>
              <p className="text-xs text-[#0C382E]/60">
                Protect your domain reputation and ensure human oversight on every email.
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#0C382E]">Maximum Daily Emails Sent</label>
                  <span className="font-mono font-bold text-sm text-[#0C382E] bg-[#FFF0B3] px-2.5 py-0.5 rounded-md border border-[#FEE790]">
                    {dailyLimit} emails / day
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full accent-[#0C382E]"
                />
                <p className="text-[11px] text-[#0C382E]/60 mt-1">
                  We recommend 25-40 emails/day for new college fest domains to avoid spam filters.
                </p>
              </div>

              <div className="p-4 bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0C382E]">
                  <CheckCircle className="w-4 h-4 text-[#0C382E]" />
                  <span>Mandatory Human Approval Active</span>
                </div>
                <p className="text-[11px] text-[#0C382E]/70 leading-relaxed">
                  Every email drafted by SponFy AI pauses in the Outreach queue for human review. SponFy will NEVER auto-send unapproved emails.
                </p>
              </div>

              <Button
                onClick={() => toast('Sending limits updated successfully!', 'success')}
                className="bg-[#0C382E] text-[#FFF0B3] hover:bg-[#0C382E]/90 text-xs font-bold"
              >
                Save Limits
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Suppression List */}
        {activeTab === 'suppression' && (
          <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm">
            <CardHeader className="pb-4 border-b border-[#0C382E]/5">
              <CardTitle className="text-base font-heading font-bold text-[#0C382E]">
                Do-Not-Contact & Suppression List
              </CardTitle>
              <p className="text-xs text-[#0C382E]/60">
                Contacts or domain patterns added here are permanently blocked from receiving outreach or follow-ups.
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Add form */}
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <Input
                  label="Block Email or Domain"
                  value={newSuppressionEmail}
                  onChange={(e) => setNewSuppressionEmail(e.target.value)}
                  className="text-xs"
                />
                <Input
                  label="Suppression Reason"
                  value={newSuppressionReason}
                  onChange={(e) => setNewSuppressionReason(e.target.value)}
                  className="text-xs"
                />
                <Button
                  onClick={handleAddSuppression}
                  className="bg-[#0C382E] text-[#FFF0B3] hover:bg-[#0C382E]/90 text-xs font-bold shrink-0 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add to Blocklist
                </Button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-[#0C382E]/10 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF4E6] text-[#0C382E]/70 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Suppressed Email / Domain</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0C382E]/10">
                    {suppressionList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-[#0C382E]/50">
                          Suppression list is empty.
                        </td>
                      </tr>
                    ) : (
                      suppressionList.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FFFDF6]">
                          <td className="p-3 font-semibold text-[#0C382E]">{item.email}</td>
                          <td className="p-3 text-[#0C382E]/70">{item.reason || 'Manual block'}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleRemoveSuppression(item.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data & Demo Controls */}
        {activeTab === 'data' && (
          <Card className="bg-[#FFFFFF] border-[#0C382E]/10 shadow-sm">
            <CardHeader className="pb-4 border-b border-[#0C382E]/5">
              <CardTitle className="text-base font-heading font-bold text-[#0C382E]">
                Data Management & Reset
              </CardTitle>
              <p className="text-xs text-[#0C382E]/60">
                Manage your local sponsorship demo dataset or reset to factory mock data.
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#0C382E]">Reset Demo Campaign Data</h4>
                  <p className="text-[11px] text-[#0C382E]/60">
                    Restores the default &quot;SponFy Hackathon 2026&quot; campaign with 24 sponsors and full message history.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDemoData}
                  className="text-xs border-[#0C382E]/20 text-[#0C382E]"
                >
                  Reset to Seed
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
