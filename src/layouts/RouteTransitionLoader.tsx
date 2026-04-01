import { GymLoadingScreen } from '../components';

/** Route-change overlay: full-viewport gym animation (shared with public gym loading). */
export function RouteTransitionLoader({ active }: { active: boolean }) {
  return (
    <GymLoadingScreen active={active} variant="fixed" zIndex={1000} message="LOADING YOUR GYM..." />
  );
}
