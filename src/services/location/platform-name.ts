export function getDetectedPlatform(): string | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;

  const userAgent = navigator.userAgent || '';
  const platformChecks = [
    { name: 'TikTok', indicators: ['tiktok', 'musically', 'TikTok', 'ByteDance'] },
    { name: 'Facebook', indicators: ['FBAN', 'FBAV', 'Facebook'] },
    { name: 'Instagram', indicators: ['Instagram', 'IGTV'] },
    { name: 'Snapchat', indicators: ['Snapchat'] },
    { name: 'Twitter', indicators: ['TwitterKit', 'Twitter'] },
    { name: 'Pinterest', indicators: ['Pinterest'] },
    { name: 'LinkedIn', indicators: ['LinkedInApp'] },
    { name: 'YouTube', indicators: ['youtube', 'YouTubeApp'] },
    { name: 'Reddit', indicators: ['Reddit'] },
    { name: 'Discord', indicators: ['Discord'] },
    { name: 'WhatsApp', indicators: ['WhatsApp'] }
  ];

  for (const platform of platformChecks) {
    if (platform.indicators.some(i => userAgent.toLowerCase().includes(i.toLowerCase()))) {
      return platform.name;
    }
  }
  return null;
}
