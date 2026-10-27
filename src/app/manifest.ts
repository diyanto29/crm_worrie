import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gmap Prospek Workspace',
    short_name: 'GmapProspek',
    description: 'Tools Manajemen Prospek Google Maps & CRM WhatsApp',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#059669',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
