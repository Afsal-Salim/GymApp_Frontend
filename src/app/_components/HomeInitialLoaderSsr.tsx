import BrandReveal from '@/app/_components/BrandReveal';

/**
 * Home first-paint loader. Renders in first HTML for `/`; exits via `HomeInitialLoaderClient`.
 */
export default function HomeInitialLoaderSsr() {
  return (
    <div id="home-initial-loader-ssr" className="route-transition-loader home-initial-loader-ssr">
      <div className="home-initial-loader-ssr__stage">
        <BrandReveal />
      </div>
    </div>
  );
}
