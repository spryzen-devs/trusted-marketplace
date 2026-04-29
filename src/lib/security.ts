// Vouch Cryptographic Security Utility
// Handles ECC (Elliptic Curve Cryptography) Signing and Verification

const PUBLIC_KEY_PEM = `MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE3ojMdxObAp16xFY4UWdWE5fXxRY2
vxPNcV0R7W9+vZy6V86/psayzWNtmcPl7czlHQZ55MiX1/QUgknXez5DBQ==`;

// Helper to convert PEM to ArrayBuffer
function pemToArrayBuffer(pem: string) {
  const b64 = pem.replace(/-----BEGIN [^-]+-----|-----END [^-]+-----|\s/g, '');
  const binary = window.atob(b64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

export async function signQrData(qrId: string, privateKeyPem: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(qrId);

  // In a real Edge Function, this would be on the server.
  // For the hackathon demo, we simulate the secure signing.
  const b64Key = privateKeyPem.replace(/-----BEGIN [^-]+-----|-----END [^-]+-----|\s/g, '');
  const binaryKey = window.atob(b64Key);
  const keyBuffer = new Uint8Array(binaryKey.length);
  for (let i = 0; i < binaryKey.length; i++) {
    keyBuffer[i] = binaryKey.charCodeAt(i);
  }

  const key = await window.crypto.subtle.importKey(
    "pkcs8",
    keyBuffer.buffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    key,
    data
  );

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyQrSignature(qrId: string, signatureHex: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(qrId);

  const sigBuffer = new Uint8Array(
    signatureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  const keyBuffer = pemToArrayBuffer(PUBLIC_KEY_PEM);
  const key = await window.crypto.subtle.importKey(
    "spki",
    keyBuffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );

  return await window.crypto.subtle.verify(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    key,
    sigBuffer,
    data
  );
}
