
import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'secret-key';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function getHash(data: string) {
    return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex').substring(0, 16);
}

// Generate Open Tracking URL
export function getOpenTrackingUrl(campaignId: string, email: string) {
    const data = `${campaignId}:${email}`;
    const hash = getHash(data);
    return `${BASE_URL}/api/track/open?c=${campaignId}&e=${encodeURIComponent(email)}&h=${hash}`;
}

// Generate Click Tracking URL
export function getClickTrackingUrl(campaignId: string, email: string, targetUrl: string) {
    const data = `${campaignId}:${email}:${targetUrl}`;
    const hash = getHash(data);
    return `${BASE_URL}/api/track/click?c=${campaignId}&e=${encodeURIComponent(email)}&u=${encodeURIComponent(targetUrl)}&h=${hash}`;
}

// Validate Hash
export function validateTrackingHash(campaignId: string, email: string, hash: string, targetUrl?: string) {
    let data;
    if (targetUrl) {
        data = `${campaignId}:${email}:${targetUrl}`;
    } else {
        data = `${campaignId}:${email}`;
    }
    const expected = getHash(data);
    return expected === hash;
}

// Inject Tracking Pixel & Rewrite Links
export function injectTracking(html: string, campaignId: string, email: string) {
    let newHtml = html;

    // 1. Inject Open Pixel (at the end of body)
    const pixelUrl = getOpenTrackingUrl(campaignId, email);
    const pixelTag = `<img src="${pixelUrl}" alt="" width="1" height="1" style="display:none !important;" />`;

    if (newHtml.includes('</body>')) {
        newHtml = newHtml.replace('</body>', `${pixelTag}</body>`);
    } else {
        newHtml += pixelTag;
    }

    // 2. Rewrite Links (Regex approach for simplicity, robust HTML parser better for complex cases)
    // Looking for <a href="..."> not starting with # or mailto:
    newHtml = newHtml.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(http[^"']+)\1/gi, (match, quote, url) => {
        const trackingUrl = getClickTrackingUrl(campaignId, email, url);
        return match.replace(url, trackingUrl);
    });

    return newHtml;
}
