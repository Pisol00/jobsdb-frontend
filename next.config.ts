import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options */
  redirects: async () => {
    return [
      // Reset Password redirect
      {
        source: '/auth/reset-password',
        destination: '/auth/forgot-password',
        permanent: false,
      },
      {
        source: '/auth/reset-password',
        has: [
          {
            type: 'query',
            key: 'token',
            value: '(?<token>.*)',
          },
        ],
        destination: '/auth/reset-password/:token',
        permanent: false,
      },
      
      // Email verification redirect
      {
        source: '/auth/verify-email',
        has: [
          {
            type: 'query',
            key: 'token',
            value: '(?<token>.*)',
          },
        ],
        destination: '/auth/verify-email/:token',
        permanent: false,
      },
      
      // OTP verification redirect
      {
        source: '/auth/verify-otp/:token',
        has: [
          {
            type: 'query',
            key: 'expiresAt',
            value: '(?<expiresAt>.*)',
          },
        ],
        destination: '/auth/verify-otp/:token/:expiresAt',
        permanent: false,
      },
      
      // OAuth callback redirect
      {
        source: '/oauth-callback',
        has: [
          {
            type: 'query',
            key: 'token',
            value: '(?<token>.*)',
          },
        ],
        destination: '/oauth-callback/:token',
        permanent: false,
      },
      
      // Login redirects for success states
      {
        source: '/auth/login',
        has: [
          {
            type: 'query',
            key: 'registered',
            value: 'true',
          },
        ],
        destination: '/auth/login/registered',
        permanent: false,
      },
      {
        source: '/auth/login',
        has: [
          {
            type: 'query',
            key: 'reset',
            value: 'success',
          },
        ],
        destination: '/auth/login/reset-success',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;