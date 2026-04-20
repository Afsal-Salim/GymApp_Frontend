'use client';

import { motion } from 'framer-motion';
import crystalLogo from '@/assets/logo.svg';

const text = 'crystal';

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const child = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function BrandReveal() {
  const logoSrc = typeof crystalLogo === 'string' ? crystalLogo : crystalLogo.src;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="home-brand-reveal"
      role="status"
      aria-label="Loading Crystal"
      aria-busy="true"
    >
      <motion.img
        src={logoSrc}
        alt=""
        aria-hidden
        variants={child}
        className="home-brand-reveal__logo"
        width={96}
        height={96}
        decoding="async"
      />
      <motion.h1 className="home-brand-reveal__text" aria-label="Crystal">
        {text.split('').map((char, index) => (
          <motion.span key={index} variants={child} className="home-brand-reveal__char">
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h1>
    </motion.div>
  );
}
