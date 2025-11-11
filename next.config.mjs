/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Handle WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Optimize solc loading
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
      };
    }

    return config;
  },
};

export default nextConfig;
