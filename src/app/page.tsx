import type { Metadata } from 'next';
import HomePage from '@/features/home/HomePage';

export const metadata: Metadata = {
  title: 'Crystal — Gym websites',
  description: 'Modern gym websites, themes, WhatsApp leads, and analytics for your fitness business.',
};

/** Marketing landing — ISR shell; home ships in the page bundle (no extra Suspense swap on first paint). */
export const revalidate = 3600;

export default function Home() {
  return <HomePage />;
}
