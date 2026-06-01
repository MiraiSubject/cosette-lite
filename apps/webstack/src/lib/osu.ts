import { env } from '$env/dynamic/private';
import { env as pubEnv } from '$env/dynamic/public';

type OAuthTokens = {
    access_token: string;
    token_type: string;
};

function getProxyUrl(path: string): string | null {
    if (!env.PRIVATE_OSU_PROXY_BASE_URL) return null;
    if (!env.PRIVATE_OSU_PROXY_SHARED_SECRET) {
        throw new Error('PRIVATE_OSU_PROXY_SHARED_SECRET is required when using PRIVATE_OSU_PROXY_BASE_URL');
    }

    return new URL(path, env.PRIVATE_OSU_PROXY_BASE_URL).toString();
}

function getProxyHeaders(): HeadersInit {
    const headers: Record<string, string> = {
        Authorization: `Bearer ${env.PRIVATE_OSU_PROXY_SHARED_SECRET}`
    };

    if (env.PRIVATE_CF_ACCESS_CLIENT_ID && env.PRIVATE_CF_ACCESS_CLIENT_SECRET) {
        headers['CF-Access-Client-Id'] = env.PRIVATE_CF_ACCESS_CLIENT_ID;
        headers['CF-Access-Client-Secret'] = env.PRIVATE_CF_ACCESS_CLIENT_SECRET;
    }

    return headers;
}

async function parseJsonResponse(response: Response, context: string) {
    if (response.ok) {
        return response.json();
    }

    throw new Error(`${context}: [${response.status}] ${response.statusText}`);
}

export async function getOsuOAuthTokens(code: string): Promise<OAuthTokens> {
    const proxyUrl = getProxyUrl('/osu/oauth/token');

    if (proxyUrl) {
        const response = await fetch(proxyUrl, {
            body: JSON.stringify({
                client_id: `${pubEnv.PUBLIC_OSU2_CLIENT_ID}`,
                code,
                redirect_uri: `${pubEnv.PUBLIC_BASE_URL}/auth/osu/callback`
            }),
            method: 'POST',
            headers: {
                ...getProxyHeaders(),
                'Content-Type': 'application/json',
            }
        });

        return parseJsonResponse(response, 'Error fetching OAuth tokens through osu! proxy');
    }

    const response = await fetch('https://osu.ppy.sh/oauth/token', {
        body: JSON.stringify({
            client_id: `${pubEnv.PUBLIC_OSU2_CLIENT_ID}`,
            client_secret: `${env.OSU2_CLIENT_SECRET}`,
            grant_type: 'authorization_code',
            code,
            redirect_uri: `${pubEnv.PUBLIC_BASE_URL}/auth/osu/callback`
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return parseJsonResponse(response, 'Error fetching OAuth tokens');
}

export async function getOsuUserData(tokens: OAuthTokens) {
    const proxyUrl = getProxyUrl('/osu/me');

    if (proxyUrl) {
        const response = await fetch(proxyUrl, {
            headers: {
                ...getProxyHeaders(),
                'X-Osu-Access-Token': tokens.access_token
            }
        });

        return parseJsonResponse(response, 'Error fetching user data through osu! proxy');
    }

    const response = await fetch('https://osu.ppy.sh/api/v2/me', {
        headers: {
            Authorization: `Bearer ${tokens.access_token}`
        }
    });

    return parseJsonResponse(response, 'Error fetching user data');
}
