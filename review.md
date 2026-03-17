# MealWise Cloud Deployment Review

## 1. Cloud Deployment Considerations

Beyond scaling, security (DDoS), and cost control:

| Concern | Why It Matters for MealWise |
|---|---|
| **Secrets management** | `JWT_SECRET` defaults to `"dev-change-this-secret"` in `backend/security.py`. SMTP creds are in plaintext `.txt` files. Use GCP Secret Manager instead. |
| **Password hashing** | `backend/security.py` uses **plain SHA-256** — no salt, no iteration. This is insecure. Switch to `bcrypt` or `argon2`. |
| **Database connection pooling** | `backend/db.py` uses direct psycopg connections. Under load, you'll exhaust Cloud SQL connections. Need a connection pool (e.g., `psycopg_pool` or Cloud SQL Auth Proxy with pgbouncer). |
| **Observability** | No structured logging, no metrics, no tracing. Add Cloud Logging / Cloud Trace integration for debugging production issues. |
| **Health checks & liveness probes** | `/api/health` exists but Cloud Run needs proper startup/liveness probes configured. |
| **CORS configuration** | `backend/main.py` likely uses `allow_origins=["*"]` — tighten this to your frontend domain only. |
| **Rate limiting** | No rate limiting on `/api/auth/request-otp` — an attacker can spam OTP emails. Add rate limiting (e.g., via Cloud Armor or middleware). |
| **Data residency & backups** | Cloud SQL automated backups, point-in-time recovery, and regional compliance (asia-southeast1). |
| **CI/CD pipeline** | No deployment automation visible — you'll want Cloud Build or GitHub Actions for reliable deploys. |
| **Cold start latency** | Python 3.13 + dataset loading on startup (`backend/db.py` seeds from CSVs) will cause slow cold starts. |

---

## 2. Scaling & Security — Code Changes Needed

### Scaling Changes

#### A. Connection pooling — `backend/db.py`

```python
# Current: single connection per request
conn = psycopg.connect(DATABASE_URL)

# Needed: connection pool
from psycopg_pool import ConnectionPool
pool = ConnectionPool(DATABASE_URL, min_size=2, max_size=10)
```

#### B. Startup data loading

`backend/db.py` loads CSVs and seeds the DB on every app start. For multiple replicas, this causes race conditions. Move seeding to a one-time migration job instead.

#### C. Cloud Run config (no code change, just deployment config)

```yaml
# Set in Cloud Run service config
minInstances: 0      # cost control
maxInstances: 10     # scaling cap
concurrency: 80      # requests per instance
```

#### D. Stateless caching

The ingredient cache in `backend/services/nutrient_calculator.py` is in-memory per instance. This is fine for Cloud Run (each instance has its own cache), but consider Redis/Memorystore if you need shared cache across instances.

### Security Changes

#### A. Password hashing — `backend/security.py`

```python
# REPLACE: hashlib.sha256(password.encode()).hexdigest()
# WITH: bcrypt
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
```

#### B. JWT secret

Remove the hardcoded default and require `JWT_SECRET` from Secret Manager:

```python
JWT_SECRET = os.environ["JWT_SECRET"]  # no default, fail if missing
```

#### C. CORS — `backend/main.py`

```python
allow_origins=["https://your-frontend-domain.run.app"]
```

#### D. Rate limiting

Add to auth endpoints. Options:

- **Cloud Armor** (infrastructure level, no code change) — best for DDoS
- **slowapi** middleware (code level):

```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@router.post("/request-otp")
@limiter.limit("3/minute")
```

#### E. Input validation

Pydantic schemas handle most of this, but raw SQL queries in `backend/db.py` should be audited for injection (the `?` → `%s` adapter looks safe since it uses parameterized queries, but worth double-checking).

#### F. HTTPS

Cloud Run handles TLS termination automatically, so no code change needed.

---

## 3. Cloud Architecture (with Freemium/Premium)

```
                         ┌──────────────────┐
    Users ──────►        │    Cloud CDN      │  ◄── Frontend (static)
                         │ (Firebase Hosting │      React + Vite build
                         │  or Cloud Storage)│
                         └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │   Cloud Armor     │  ◄── DDoS protection,
                         │   (WAF)           │      IP-based rate limiting
                         └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │  Load Balancer    │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
         ┌─────────┐        ┌─────────┐        ┌─────────┐
         │ Cloud   │        │ Cloud   │        │ Cloud   │
         │ Run     │        │ Run     │        │ Run     │
         │ inst. 1 │        │ inst. 2 │        │ inst. N │
         └────┬────┘        └────┬────┘        └────┬────┘
              │                  │                   │
              └──────────────────┼───────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
           ┌──────────────┐ ┌────────┐ ┌───────────┐
           │  Cloud SQL   │ │ Stripe │ │ Firebase  │
           │ (PostgreSQL) │ │  API   │ │   Auth    │
           └──────────────┘ └────────┘ └───────────┘
                 │
          ┌──────┴──────┐
          ▼             ▼
    ┌──────────┐  ┌──────────┐
    │  Primary │  │  Read    │  ◄── Optional: add read
    │  (R/W)   │  │  Replica │      replica when traffic
    └──────────┘  └──────────┘      justifies it
```

### Key Components

| Component | Service | Purpose |
|-----------|---------|---------|
| **Frontend** | Firebase Hosting / Cloud Storage + CDN | Serve static React build globally, cached at edge |
| **DDoS / WAF** | Cloud Armor | Rate limiting, geo-blocking, OWASP rule sets |
| **Backend** | Cloud Run (auto-scaled) | FastAPI container, `min-instances: 1` (premium SLA), `max-instances: 10` |
| **Database** | Cloud SQL (PostgreSQL) | Managed DB with automated backups, encryption at rest |
| **Auth** | Firebase Auth | User identity for free/premium tier enforcement |
| **Payments** | Stripe | Subscription management, webhook → tier updates |
| **Secrets** | GCP Secret Manager | JWT secret, DB credentials, Stripe keys |
| **Monitoring** | Cloud Logging + Cloud Trace | Structured logs, request tracing, alerting |

### Request Flow

```
User → CDN (static assets) or LB (API calls)
  → Cloud Armor (rate limit check)
    → Cloud Run instance
      → Firebase Auth middleware (who are you?)
        → Tier-check middleware (free or premium?)
          → Route handler
            → Cloud SQL (PostgreSQL)
              → Response
```

### Scaling Configuration

```yaml
# Cloud Run
minInstances: 1        # always-on for premium users
maxInstances: 10       # cost cap
concurrency: 80        # requests per instance
cpu: 1                 # 1 vCPU per instance
memory: 512Mi          # sufficient for FastAPI + caching

# Cloud SQL
tier: db-g1-small      # 1 shared vCPU, 1.7 GB RAM
storage: 10 GB SSD     # auto-increase enabled
backups: daily         # 7-day retention
```

### Cost Control

```
┌──────────────────────────────────────────────────┐
│              Budget Alert Pipeline                │
│                                                  │
│  GCP Billing ──► Budget Alert (Pub/Sub)          │
│       at 50%, 80%, 100% of threshold             │
│                    │                             │
│                    ▼                             │
│            Budget Handler                        │
│       (auto-scales Cloud Run                     │
│        max-instances to 1 at 100%)               │
│                                                  │
│  Hard caps:                                      │
│   • Cloud Run max-instances: 10                  │
│   • Cloud SQL fixed tier (no auto-upgrade)       │
│   • Free-tier rate limit: 30 req/min per user    │
│   • Premium rate limit: 200 req/min per user     │
└──────────────────────────────────────────────────┘
```

### Estimated Monthly Cost

| Service | Free Tier Coverage | Estimated Cost |
|---------|-------------------|----------------|
| Cloud Run (1 min instance + auto-scale) | 2M requests/month free | $5–15 |
| Cloud SQL (db-g1-small) | None | ~$25 |
| Firebase Auth | 10K users/month free | $0 |
| Firebase Hosting / CDN | 10 GB/month free | $0–1 |
| Cloud Armor | First 2 policies free | $0–5 |
| Stripe | 2.9% + $0.30 per transaction | Variable |
| **Total (before revenue)** | | **~$30–50/month** |

---

## 4. Summary of Priority Actions

| Priority | Action | Effort |
|---|---|---|
| **Critical** | Fix password hashing (SHA-256 → bcrypt) | Small |
| **Critical** | Move secrets to GCP Secret Manager | Small |
| **Critical** | Tighten CORS origins | Trivial |
| **High** | Add connection pooling | Medium |
| **High** | Add rate limiting on auth endpoints | Small |
| **High** | Move DB seeding out of app startup | Medium |
| **Medium** | Add structured logging | Small |
| **Medium** | Set up Cloud Armor for DDoS protection | Config only |
| **Low** | Add Redis for shared caching | Medium |
