const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,

  allowedDevOrigins: [
    "192.168.0.106",
  ],
};

module.exports = withPWA(nextConfig);