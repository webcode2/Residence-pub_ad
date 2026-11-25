import { headers } from 'next/headers';

/** Public origin used for payment return links: APP_URL when set (the tunnel/production domain), else the caller's origin. */
export async function appOrigin(): Promise<string | null> {
    const configured = process.env.APP_URL;
    if (configured) {
        try { return new URL(configured).origin; } catch { throw new Error('APP_URL must be a full URL, e.g. https://residence.elastrocloud.com'); }
    }
    const origin = (await headers()).get('origin');
    return origin && /^https?:\/\//.test(origin) ? origin : null;
}
