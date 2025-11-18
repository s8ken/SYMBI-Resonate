# Key Management Guide

## Rotation
- Maintain multiple Ed25519 public keys in `ED25519_KEYS_JSON` as a map from `kid` to base64-encoded public key.
- Generate a new keypair and compute `kid` as `sha256Hex(hex(public_key_bytes))`.
- Publish the new `kid` in `ED25519_KEYS_JSON`; keep old entries until all tickets signed with old keys expire.

## KID Computation
- KID is the SHA-256 of the public key bytes rendered as hex.
- During signing, the `kid` is embedded into signature fields as `alg:kid:sig_base64`.

## Environment Updates
- Set `VITE_ED25519_KEYS_JSON` (or `ED25519_KEYS_JSON`) to a JSON string: `{ "<kid>": "<pub_b64>", ... }`.
- Optionally set single-key `VITE_ED25519_PUBLIC_KEY_BASE64` and `VITE_ED25519_PRIVATE_KEY_BASE64` for signing.
- Backend uses `Deno.env.get('ED25519_KEYS_JSON')` or `ED25519_PUBLIC_KEY_BASE64` to select the correct key by `kid`.

## Procedures
- Rotate: add new key to JSON, start signing with new private key, monitor verification for both keys.
- Revoke: stop signing with a `kid`; remove it from JSON only after all dependent tickets are retired.

## Validation
- Run CLI `symbi-cli verify:ticket <ticket.json>` to confirm signatures resolve via `kid` and verify.
