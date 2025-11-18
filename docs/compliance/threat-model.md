# Threat Model (STRIDE)

- Spoofing: Ed25519 signatures validate receipts
- Tampering: Merkle roots, ledger anchors
- Repudiation: Append-only ledger
- Information Disclosure: RLS, retention purge
- Denial of Service: Metrics and planned rate limiting
- Elevation of Privilege: Policies and planned RBAC

