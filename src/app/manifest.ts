import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SponFy",
    short_name: "SponFy",
    description:
      "Find, research and win sponsors for campaigns, conferences, summits, and organizations — with AI that asks before it sends.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0C382E",
    theme_color: "#0C382E",
    lang: "en-IN",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open SponFy campaign dashboard",
        url: "/app",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Outreach",
        short_name: "Outreach",
        description: "Review and approve sponsor outreach",
        url: "/app/outreach",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
          },
        ],
      },
    ],
  };
}
