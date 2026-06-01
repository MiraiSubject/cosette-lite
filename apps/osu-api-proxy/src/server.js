import { createServer } from 'node:http';

const OSU_BASE_URL = 'https://osu.ppy.sh';
const PORT = Number(process.env.PORT ?? process.env.OSU_PROXY_PORT ?? 8787);
const HOST = process.env.HOST ?? '127.0.0.1';
const SHARED_SECRET = process.env.OSU_PROXY_SHARED_SECRET;
const OSU_CLIENT_SECRET = process.env.OSU2_CLIENT_SECRET;

function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers
  });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 16_384) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function assertAuthorized(req, res) {
  if (!SHARED_SECRET) {
    sendJson(res, 500, { error: 'Proxy is missing OSU_PROXY_SHARED_SECRET.' });
    return false;
  }

  const auth = req.headers.authorization ?? '';
  if (auth !== `Bearer ${SHARED_SECRET}`) {
    sendJson(res, 401, { error: 'Unauthorized.' });
    return false;
  }

  return true;
}

async function proxyToken(req, res) {
  if (!OSU_CLIENT_SECRET) {
    sendJson(res, 500, { error: 'Proxy is missing OSU2_CLIENT_SECRET.' });
    return;
  }

  const body = await readJson(req);
  const code = typeof body.code === 'string' ? body.code : '';
  const clientId = typeof body.client_id === 'string' ? body.client_id : '';
  const redirectUri = typeof body.redirect_uri === 'string' ? body.redirect_uri : '';

  if (!code || !clientId || !redirectUri) {
    sendJson(res, 400, { error: 'code, client_id, and redirect_uri are required.' });
    return;
  }

  const osuRes = await fetch(`${OSU_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: OSU_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  });

  const text = await osuRes.text();
  res.writeHead(osuRes.status, {
    'content-type': osuRes.headers.get('content-type') ?? 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(text);
}

async function proxyMe(req, res) {
  const accessToken = req.headers['x-osu-access-token'];
  if (typeof accessToken !== 'string' || !accessToken) {
    sendJson(res, 400, { error: 'x-osu-access-token header is required.' });
    return;
  }

  const osuRes = await fetch(`${OSU_BASE_URL}/api/v2/me`, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });

  const text = await osuRes.text();
  res.writeHead(osuRes.status, {
    'content-type': osuRes.headers.get('content-type') ?? 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(text);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (!assertAuthorized(req, res)) return;

    if (req.method === 'POST' && url.pathname === '/osu/oauth/token') {
      await proxyToken(req, res);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/osu/me') {
      await proxyMe(req, res);
      return;
    }

    sendJson(res, 404, { error: 'Not found.' });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unexpected proxy error.'
    });
  }
});

server.listen(PORT, HOST, () => {
  console.info(`osu-api-proxy listening on http://${HOST}:${PORT}`);
});
