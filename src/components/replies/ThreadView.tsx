'use client';

import React from 'react';
import { Mail, Clock, Send, User } from 'lucide-react';
import { Message, Company } from '@/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ThreadViewProps {
  message: Message;
  company?: Company;
  allThreadMessages?: Message[];
  onComposeReply: () => void;
}

export function ThreadView({ message, company, allThreadMessages = [], onComposeReply }: ThreadViewProps) {
  const messagesToDisplay = allThreadMessages.length > 0 ? allThreadMessages : [message];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFDF6] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#0C382E]/10 bg-[#FFFFFF] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-heading font-bold text-lg text-[#0C382E]">{message.subject}</h2>
            {company?.stage && (
              <Badge variant="green" className="text-xs">
                {company.stage}
              </Badge>
            )}
          </div>
          <p className="text-xs text-[#0C382E]/60">
            Sponsor: <span className="font-semibold text-[#0C382E]">{company?.name || 'Partner'}</span> • {message.fromEmail}
          </p>
        </div>
        <Button
          onClick={onComposeReply}
          variant="green"
          size="sm"
          className="text-xs gap-2 font-bold"
        >
          <Mail className="w-3.5 h-3.5" />
          Reply / Take Action
        </Button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messagesToDisplay.map((msg: Message, index: number) => {
          const isOutbound = msg.direction === 'outbound';
          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <div className="w-5 h-5 rounded-full bg-[#0C382E]/10 flex items-center justify-center text-[10px] font-bold text-[#0C382E]">
                  {isOutbound ? 'ME' : 'SP'}
                </div>
                <span className="text-xs font-semibold text-[#0C382E]">
                  {isOutbound ? 'You (via Connected Gmail)' : msg.fromEmail}
                </span>
                <span className="text-[10px] text-[#0C382E]/40 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {formatDate(msg.sentAt)}
                </span>
              </div>

              <div
                className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm text-sm ${
                  isOutbound
                    ? 'bg-[#0C382E] text-[#FAF4E6] rounded-tr-sm'
                    : 'bg-[#FFFFFF] border border-[#0C382E]/10 text-[#0C382E] rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs md:text-sm leading-relaxed">
                  {msg.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
