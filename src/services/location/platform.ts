// Webview detection utility for major ad platforms

export function isTikTokWebView(): boolean {
    return isAdPlatformWebView('tiktok');
}

export function isAdPlatformWebView(platform?: string): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent || '';

    const webviewIndicators: Record<string, string[]> = {
        tiktok: ['tiktok', 'musically', 'musical_ly', 'TikTok', 'ByteDance'],
        facebook: ['FBAN', 'FBAV', 'FBA', 'Facebook', 'FacebookApp'],
        instagram: ['Instagram', 'IGTV'],
        snapchat: ['Snapchat'],
        twitter: ['TwitterKit', 'Twitter'],
        pinterest: ['Pinterest'],
        linkedin: ['LinkedInApp'],
        youtube: ['youtube', 'YouTubeApp'],
        reddit: ['Reddit', 'RedditApp'],
        discord: ['Discord', 'DiscordApp'],
        whatsapp: ['WhatsApp', 'WhatsAppWebView']
    };

    if (platform) {
        const platformKey = platform.toLowerCase() as keyof typeof webviewIndicators;
        const indicators = webviewIndicators[platformKey];
        return indicators ? indicators.some(i => userAgent.toLowerCase().includes(i.toLowerCase())) : false;
    }

    return Object.values(webviewIndicators).some(indicators =>
        indicators.some(i => userAgent.toLowerCase().includes(i.toLowerCase()))
    );
}

export function getDetectedPlatform(): string | null {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return null;
    const userAgent = navigator.userAgent || '';

    const platformChecks = [
        { name: 'TikTok', indicators: ['tiktok', 'musically', 'musical_ly', 'TikTok', 'ByteDance'] },
        { name: 'Facebook', indicators: ['FBAN', 'FBAV', 'FBA', 'Facebook', 'FacebookApp'] },
        { name: 'Instagram', indicators: ['Instagram', 'IGTV'] },
        { name: 'Snapchat', indicators: ['Snapchat'] },
        { name: 'Twitter', indicators: ['TwitterKit', 'Twitter'] },
        { name: 'Pinterest', indicators: ['Pinterest'] },
        { name: 'LinkedIn', indicators: ['LinkedInApp'] },
        { name: 'YouTube', indicators: ['youtube', 'YouTubeApp'] },
        { name: 'Reddit', indicators: ['Reddit', 'RedditApp'] },
        { name: 'Discord', indicators: ['Discord', 'DiscordApp'] },
        { name: 'WhatsApp', indicators: ['WhatsApp', 'WhatsAppWebView'] }
    ];

    for (const platform of platformChecks) {
        if (platform.indicators.some(i => userAgent.toLowerCase().includes(i.toLowerCase()))) {
            return platform.name;
        }
    }
    return null;
}
