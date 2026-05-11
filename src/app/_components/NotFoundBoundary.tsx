/**
 * Catches `notFound()` sentinels thrown from page components (originally a Next.js feature) and
 * renders the dedicated `<NotFound />` screen in their place.
 *
 * Lives at the top of the router tree so any route can short-circuit to 404 without breaking
 * back/forward navigation.
 */
import { Component, type ReactNode } from 'react';
import { isNextNotFoundError, isNextRedirectError } from '@/lib/next-shim/navigation';
import NotFound from '@/features/NotFound/NotFound';

interface State {
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

export default class NotFoundBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    if (isNextRedirectError(error)) {
      /* Redirect was applied via `window.location.replace`; render nothing during the swap. */
      return { error };
    }
    if (isNextNotFoundError(error)) {
      return { error };
    }
    /** Let other errors propagate to the next boundary. */
    throw error;
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    /** Reset the boundary when the user navigates to a different route. */
    if (prevState.error && typeof window !== 'undefined') {
      const onPop = () => this.setState({ error: null });
      window.addEventListener('popstate', onPop, { once: true });
    }
  }

  render() {
    if (this.state.error) {
      if (isNextRedirectError(this.state.error)) {
        return null;
      }
      return <NotFound />;
    }
    return this.props.children;
  }
}
