import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

export const metadata: Metadata = {
  title: 'Crystal — Gym websites',
  description: 'Modern gym websites, themes, WhatsApp leads, and analytics for your fitness business.',
};

const HomePage = dynamic(() => import('@/features/home/HomePage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Home() {
  return <HomePage />;
}
