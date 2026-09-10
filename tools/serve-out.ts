// Serve the static export in out/ the way a static host does — used by
// tools/snap.ts (looking) and playwright.config.ts (testing), so both see the
// same file resolution.
//
//   node tools/serve-out.ts [--port 4173]
//
// Resolution order matters: a static export writes BOTH `ar.html` and an `ar/`
// folder (the RSC payload), so `/ar` must resolve to `ar.html` before the
// folder is considered. That is what Vercel does; the first version of this
// server did it the other way round and 404'd every Arabic page.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.json': 'application/json',
};

export function createStaticServer(site: string): Server {
  return createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = normalize(join(site, url));
    if (!file.startsWith(site)) {
      res.writeHead(403).end();
      return;
    }
    const candidates = [`${file}.html`, join(file, 'index.html'), file];
    file = candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? file;
    if (!existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404, { 'content-type': 'text/html' });
      createReadStream(join(site, '404.html')).pipe(res);
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
}

export async function listen(server: Server, port = 0): Promise<number> {
  await new Promise<void>((r) => server.listen(port, '127.0.0.1', r));
  return (server.address() as AddressInfo).port;
}

// Run directly: serve out/ on --port (default 4173) until killed.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--port');
  const port = i >= 0 ? Number(args[i + 1]) : 4173;
  const site = resolve('out');
  if (!existsSync(join(site, 'index.html'))) {
    console.error('out/index.html not found — run `pnpm build` first');
    process.exit(1);
  }
  const server = createStaticServer(site);
  const bound = await listen(server, port);
  console.log(`serving ${site} on http://127.0.0.1:${bound}`);
}
