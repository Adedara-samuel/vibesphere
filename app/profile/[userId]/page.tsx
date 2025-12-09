'use client';

import { useParams } from 'next/navigation';
import Profile from '@/components/Profile';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  return <Profile userId={userId} />;
}