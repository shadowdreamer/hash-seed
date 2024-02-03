import { Hono } from 'hono';
// import { cors } from 'hono/cors'
import { Client, fql, ServiceError } from 'fauna';
import { serveStatic } from 'hono/cloudflare-workers'
import su from 'short-uuid'

type Bindings = {
  FAUNA_SECRET: string;
};

type Variables = {
  faunaClient: Client;
};

type SeedHash = {
  id: string;
  seed:string;
  stamp:number;
};
 
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.get('*', serveStatic({ root: './' }))
app.get('/favicon.ico', serveStatic({ path: './favicon.ico' }))

app.use('/api/*', async (c, next) => {
  const faunaClient = new Client({
    secret: c.env.FAUNA_SECRET,
  });
  c.set('faunaClient', faunaClient);
  await next();
}
);

app.post('/api/newSeed', async (c) => {
  const { stamp } = await c.req.json<Omit<SeedHash, 'id'>>();
  const seed = su.generate();
  const myText = new TextEncoder().encode(seed);
  const digest = await crypto.subtle.digest(
    {
      name: 'SHA-256',
    },
    myText 
  );

  const hexString = [...new Uint8Array(digest)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
 
  const query = fql`SeedHash.create({
    seed: ${seed},
    stamp: ${stamp},
    hash: ${hexString}
  })`;
  const result = await c.var.faunaClient.query<SeedHash>(query);
  return c.json({
    id:result.data.id,
    stamp:result.data.stamp,
    hash:hexString
  });
});

app.get('/api/getSeed', async (c) => {
  const id = c.req.query('id');
  const query = fql`getSeed(${id})`;
  const result = await c.var.faunaClient.query<SeedHash>(query);
  return c.json(result.data);
});

app.get('/', (c) => {
  return c.text('Hello World');
});

export default app;
