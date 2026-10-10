'use client';

import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { SettingsTabs } from '@/components/settings/SettingsTabs';

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#0C382E] text-[#FFF0B3] flex items-center justify-center shadow-md">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#0C382E]">Settings & Controls</h1>
          <p className="text-xs text-[#0C382E]/60">
            Configure sender identities, Gmail OAuth credentials, safety limits, and contact suppression
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <SettingsTabs />
    </div>
  );
}
