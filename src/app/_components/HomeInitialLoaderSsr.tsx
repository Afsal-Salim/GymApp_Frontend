import { CrystalClientLogoLoader } from '@/features/crystal/CrystalClientLogoLoader';

/**
 * Same loader as profile / global route transitions (`CrystalClientLogoLoader` + animated gradient).
 * Renders in the first HTML for `/`; styles are pulled into `globals.css` so the gradient flow runs before JS.
 */
export default function HomeInitialLoaderSsr() {
  return (
    <div id="home-initial-loader-ssr" className="route-transition-loader home-initial-loader-ssr">
      <CrystalClientLogoLoader />
    </div>
  );
}
