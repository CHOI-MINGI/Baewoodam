"use client";

import { useSession } from 'next-auth/react';
import ActorHome from '@/components/home/ActorHome';
import AgencyHome from '@/components/home/AgencyHome';

export default function HomePage() {
  const { data: session } = useSession();
  const roleType = (session?.user as any)?.roleType;

  if (roleType === 'AGENCY') return <AgencyHome />;
  return <ActorHome />;
}
