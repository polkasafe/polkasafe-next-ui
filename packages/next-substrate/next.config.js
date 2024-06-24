// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable indent */

/* eslint-disable sort-keys */
/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          // matching all v1 API routes
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: '*' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'Content-Security-Policy', value: "default-src 'self'; img-src '*'" }
          ]
        }
      ];
    },
    transpilePackages: ["next-common"],
    images: {
      domains: ['parachains.info', 's2.coinmarketcap.com', 'resources.smartlayer.network', 'i.ibb.co', 'www.google.com']
    },
    reactStrictMode: true,
    webpack(config) {
      config.module.rules.push(
        {
        test: /\.svg$/,
        use: ['@svgr/webpack']
        },
        {
        test: /\.md$/,
        use: "raw-loader",
        }
    );
  
      return config;
    }
  };
  
  module.exports = nextConfig;