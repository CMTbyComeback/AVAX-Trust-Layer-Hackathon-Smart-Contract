┌─────────────────────────────────────────────────────────────────────┐
│                        AVAX TRUST LAYER                             │
│                  Zero-gas, real-time risk oracle                    │
└─────────────────────────────────────────────────────────────────────┘
+----------------+       EIP-712       +-------------------+
|  Off-chain     |  ───────────────►   |  InvarianceRegistry   (UUPS Proxy)  |
|  Python Scanner|   Signed Message    +-------------------+--------------------+
|  (Zero gas)    |                      ▲                  ▲
+----------------+                      │                  │
                                        │                  │
                                   on-chain         on-chain
                                 ANALYZER_ROLE     SIGNER_ROLE
                                        │                  │
                                        ▼                  ▼
                               +----------------+   +------------------+
                               |  Emergency     |   |  Curator / Admin |
                               |  Admin (Pause) |   |  (Override)      |
                               +----------------+   +------------------+
                                        ▲
                                        │
                                        ▼
                               +-------------------+
                               |  The Graph Subgraph    ← Real-time indexing
                               +-------------------+--------------------+
                                                         ▲
                                                         │
                                                         ▼
                                                +------------------+
                                                |  Frontend (Next.js)   ← Live dashboard
                                                +------------------+
