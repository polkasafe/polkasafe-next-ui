/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
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
      transpilePackages: ['next-common'],
      images: {
          domains: ['parachains.info', 's2.coinmarketcap.com', 'resources.smartlayer.network', 'i.ibb.co', 'www.google.com', 'testing2.polkasafe.xyz', 'porcini.rootscan.io', 'assets.coingecko.com', 'api.rootscan.io', 'api-porcini.rootscan.io']
      },
      reactStrictMode: false,
      webpack(config) {
          config.module.rules.push(
              {
                  test: /\.svg$/,
                  use: ['@svgr/webpack']
              },
              {
                  test: /\.md$/,
                  use: 'raw-loader'
              }
          );
  
          return config;
      },
      env: {
          NEXT_PUBLIC_DEPLOYMENT: process.env.NEXT_PUBLIC_DEPLOYMENT,
          NEXT_PUBLIC_SDK_BASE_URL: process.env.NEXT_PUBLIC_SDK_BASE_URL,
          NEXT_PUBLIC_POLKASAFE_FIREBASE_CONFIG_CLIENT: process.env.POLKASAFE_FIREBASE_CONFIG_CLIENT,
          NEXT_ONRAMP_APP_ID: process.env.NEXT_ONRAMP_APP_ID
      },
      eslint: {
        ignoreDuringBuilds: true,
      },
      typescript: {
        ignoreBuildErrors: true,
      },
  };

export default nextConfig;
