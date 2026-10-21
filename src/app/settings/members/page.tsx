"use client";

import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { memberApi } from '@/lib/api/members';
import { Member } from '@/types';
import { useEffect, useState } from 'react';
import { hasPermission } from '@/lib/permissions';

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canManage = hasPermission(user?.role, 'MANAGE_MEMBERS');

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await memberApi.getMembers();
        setMembers(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadMembers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Team Members</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage who has access to this workspace</p>
        </div>
        {canManage && <Button>Invite Member</Button>}
      </div>

      <div className="bg-surface border border-outline/20 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">No members found.</div>
        ) : (
          <div className="divide-y divide-outline/10">
            {members.map(member => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-surface-variant/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {member.name?.charAt(0) || member.email.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-on-surface text-sm">{member.name || member.email}</p>
                    <p className="text-xs text-on-surface-variant">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {member.status === 'PENDING' && (
                    <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-xs rounded-full">Pending</span>
                  )}
                  <span className="text-xs font-medium text-on-surface-variant w-16">{member.role}</span>
                  {canManage && (
                    <Button variant="ghost" size="sm" className="text-error hover:text-error hover:bg-error/10">Remove</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
