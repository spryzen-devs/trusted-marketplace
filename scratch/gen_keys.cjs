const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log('--- PUBLIC KEY ---');
console.log(publicKey);
console.log('--- PRIVATE KEY ---');
console.log(privateKey);
