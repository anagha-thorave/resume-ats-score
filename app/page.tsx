'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAppContext } from '@/lib/context';

export default function HomePage() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const { addToast } = useAppContext();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  const handleExploreFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else router.push('/dashboard');
  };

  return (
    <>
      <LandingPage
        onGetStarted={handleGetStarted}
        onOpenAuth={() => setAuthOpen(true)}
        onExploreFeatures={handleExploreFeatures}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={() => {
          addToast('Signed in successfully!', 'success');
          router.push('/dashboard');
        }}
      />
    </>
  );
}
