export function isTikTokWebView(): boolean {
  return isAdPlatformWebView('tiktok');
}

export function isAdPlatformWebView(platform?: string): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent || '';
  
  const webviewIndicators: Record<string, string[]> = {
    tiktok: ['tiktok', 'musically', 'TikTok', 'ByteDance'],
    facebook: ['FBAN', 'FBAV', 'Facebook'],
    instagram: ['Instagram', 'IGTV'],
    snapchat: ['Snapchat'],
    twitter: ['TwitterKit'],
    pinterest: ['Pinterest'],
    linkedin: ['LinkedInApp'],
    youtube: ['youtube', 'YouTubeApp'],
    reddit: ['Reddit'],
    discord: ['Discord'],
    whatsapp: ['WhatsApp']
  };

  if (platform) {
    const indicators = webviewIndicators[platform.toLowerCase()];
    return indicators ? indicators.some(i => userAgent.toLowerCase().includes(i.toLowerCase())) : false;
  }
  return Object.values(webviewIndicators).some(indicators =>
    indicators.some(i => userAgent.toLowerCase().includes(i.toLowerCase()))
  );
}
