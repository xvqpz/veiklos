import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const ISSUER = process.env.ISSUER;
const CLIENT_ID = process.env.CLIENT_ID;
const TENANT_ID = process.env.TENANT_ID;

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

export function verifyJwt(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization: Bearer <token>' });

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ['RS256'],
      audience: CLIENT_ID,
      issuer: ISSUER,
    },
    (err, payload) => {
      if (err) {
        console.error('JWT verify error:', err);
        return res.status(401).json({ error: 'Invalid token', details: err.message });
      }
      if (payload.tid && payload.tid !== TENANT_ID) {
        return res.status(403).json({ error: 'Forbidden: wrong tenant' });
      }
      req.user = payload;
      next();
    }
  );
}
