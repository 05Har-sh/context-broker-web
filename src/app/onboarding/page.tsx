import { redirect } from 'next/navigation';

// Onboarding flow is handled inside the unified /login auth page
export default function OnboardingPage() {
  redirect('/login');
}
