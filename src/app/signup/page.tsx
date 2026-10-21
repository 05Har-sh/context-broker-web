"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?tab=signup');
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#0084FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-zinc-400">Loading Brainwave Account Creation…</p>
      </div>
    </div>
  );
}
