'use client';

import { useEffect } from 'react';

type Props = {
  /** e.g. `.fitcore-pro-template` — must match the wrapper on the template root */
  rootClass: string;
};

/**
 * GrapesJS-style navbar: toggles `.navbar--open` on the inner `.navbar` (templates ship without JS).
 */
export function TemplateMobileNav({ rootClass }: Props) {
  useEffect(() => {
    const root = document.querySelector(rootClass);
    if (!root) return;

    const toggle = root.querySelector<HTMLElement>('.navbar-menu-toggle');
    const navbar = root.querySelector<HTMLElement>('.navbar');
    if (!toggle || !navbar) return;

    const onClick = () => {
      navbar.classList.toggle('navbar--open');
    };

    toggle.addEventListener('click', onClick);
    return () => toggle.removeEventListener('click', onClick);
  }, [rootClass]);

  return null;
}
