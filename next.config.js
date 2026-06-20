const isCapacitor = process.env.CAPACITOR_BUILD === "true";

let nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true,
  },

  allowedDevOrigins: ["192.168.0.106"],
};

if (!isCapacitor) {
  const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  });

  nextConfig = withPWA(nextConfig);
}

module.exports = nextConfig;