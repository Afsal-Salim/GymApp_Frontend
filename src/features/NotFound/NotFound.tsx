'use client';

import { Box, Typography, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { keyframes } from '@emotion/react';
import { useRouter } from 'next/navigation';
import { crystalMarketingAbsoluteUrl, getPublicGymSlugFromHost } from '@/config/env';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const NEON_GRAD_ID = 'notfoundEmojiNeon';
const NEON_FLOOR_ID = 'notfoundEmojiNeonFloor';

/**
 * 404-style face: same neon treatment as the app mascot, but X eyes (lost / dead link), worried brows, and a frown.
 */
function NotFoundEmojiMark({ size = 200 }: { size?: number }) {
  const w = (size * 280) / 200;
  const h = (size * 220) / 200;
  const g = `url(#${NEON_GRAD_ID})`;
  const gf = `url(#${NEON_FLOOR_ID})`;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 280 220"
      aria-hidden
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <linearGradient id={NEON_GRAD_ID} x1="52" y1="36" x2="228" y2="198" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0fdff" />
          <stop offset="22%" stopColor="#cffafe" />
          <stop offset="48%" stopColor="#22d3ee" />
          <stop offset="78%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id={NEON_FLOOR_ID} x1="70" y1="178" x2="210" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity={0.45} />
          <stop offset="100%" stopColor="#0891b2" stopOpacity={0.25} />
        </linearGradient>
      </defs>

      <ellipse cx="140" cy="188" rx="84" ry="20" fill={gf} />

      <g stroke={g} strokeWidth={6} strokeLinecap="round" fill="none">
        <g transform="translate(34, 112)">
          <line x1="0" y1="-9" x2="0" y2="9" />
          <line x1="-9" y1="0" x2="9" y2="0" />
        </g>
        <g transform="translate(48, 178)">
          <line x1="0" y1="-8" x2="0" y2="8" />
          <line x1="-8" y1="0" x2="8" y2="0" />
        </g>
        <g transform="translate(238, 52)">
          <line x1="0" y1="-9" x2="0" y2="9" />
          <line x1="-9" y1="0" x2="9" y2="0" />
        </g>
        <g transform="translate(248, 122)">
          <line x1="0" y1="-8" x2="0" y2="8" />
          <line x1="-8" y1="0" x2="8" y2="0" />
        </g>
      </g>

      <g stroke={g} strokeWidth={7} strokeLinecap="round">
        <line x1="78" y1="48" x2="78" y2="66" />
        <line x1="90" y1="44" x2="90" y2="64" />
      </g>

      <circle cx="140" cy="118" r="56" fill="none" stroke={g} strokeWidth={6} />

      {/* Worried / sad brows — steeper inward slump */}
      <g fill="none" stroke={g} strokeWidth={5.5} strokeLinecap="round">
        <path d="M 102 96 Q 118 76 134 90" />
        <path d="M 178 96 Q 162 76 146 90" />
      </g>

      {/* X eyes — reads clearly as “not found / broken” on a 404 */}
      <g stroke={g} strokeWidth={5.5} strokeLinecap="round">
        <line x1="115" y1="107" x2="129" y2="121" />
        <line x1="115" y1="121" x2="129" y2="107" />
        <line x1="151" y1="107" x2="165" y2="121" />
        <line x1="151" y1="121" x2="165" y2="107" />
      </g>

      {/* Deep frown */}
      <path
        d="M 110 128 Q 140 176 170 128"
        fill="none"
        stroke={g}
        strokeWidth={5.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function NotFound() {
  const router = useRouter();

  const goHome = () => {
    if (getPublicGymSlugFromHost()) {
      window.location.href = crystalMarketingAbsoluteUrl('/');
    } else {
      router.push('/');
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse 130% 90% at 50% 0%, #0a0f1a 0%, #04060c 42%, #020308 100%)',
        color: '#fafafa',
        textAlign: 'center',
        px: 2,
        py: { xs: 3, sm: 4 },
        fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 960 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2.5,
            animation: `${float} 3.2s ease-in-out infinite`,
          }}
        >
          <NotFoundEmojiMark size={200} />
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            fontSize: {
              xs: 'clamp(4.25rem, 28vw, 7rem)',
              sm: 'clamp(6rem, 22vw, 9rem)',
              md: 'clamp(7.5rem, 18vw, 11rem)',
              lg: 'clamp(8.5rem, 14vw, 12rem)',
            },
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 45%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 0.5,
          }}
        >
          404
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{
            mt: 2,
            mb: 1,
            fontWeight: 700,
            fontSize: {
              xs: 'clamp(1.35rem, 4.2vw, 1.55rem)',
              sm: 'clamp(1.55rem, 3.2vw, 1.85rem)',
              md: '1.95rem',
            },
            lineHeight: 1.35,
            color: '#f8fafc',
          }}
        >
          You lifted the{' '}
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              fontWeight: 800,
              background:
                'linear-gradient(135deg, #ffffff 0%, #ecfeff 18%, #67e8f9 40%, #22d3ee 62%, #06b6d4 82%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            wrong route
          </Box>{' '}
          💀
        </Typography>

        <Typography
          component="p"
          sx={{
            mt: 1,
            mb: 0,
            color: '#f1f5f9',
            fontWeight: 500,
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
            width: '100%',
            maxWidth: '100%',
            mx: 'auto',
            fontSize: 'clamp(0.7rem, 2.5vw, 1.05rem)',
            overflowX: 'auto',
            overflowY: 'hidden',
            textAlign: 'center',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(148, 163, 184, 0.35)',
              borderRadius: 3,
            },
          }}
        >
          This page doesn&apos;t exist... even our server skipped leg day.
        </Typography>

        <Box
          sx={{
            mt: 4,
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={goHome}
            sx={{
              bgcolor: '#60a5fa',
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              py: 1.25,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#3b82f6',
              },
            }}
          >
            Go Home
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon sx={{ color: 'inherit' }} />}
            onClick={() => router.back()}
            sx={{
              borderColor: '#64748b',
              borderWidth: 2,
              color: '#f8fafc',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              py: 1.25,
              bgcolor: 'rgba(15, 23, 42, 0.25)',
              '&:hover': {
                borderColor: '#94a3b8',
                bgcolor: 'rgba(51, 65, 85, 0.4)',
              },
            }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
