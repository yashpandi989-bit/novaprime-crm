import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.novaprime.crm",
  appName: "NOVACRM",
  webDir: ".next",
  server: {
    url: "https://novaprime-crm.vercel.app",
    cleartext: false,
  },
};

export default config;