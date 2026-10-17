# Chhota Genius 🌟 (छोटे उस्ताद, बड़ी सीख)

> **A child-friendly, safe educational learning platform for children aged 3–8.**
> Built with Next.js 14 App Router, TypeScript (Strict Mode), Tailwind CSS, PostgreSQL, Prisma ORM, and Zod.

---

## 📖 Table of Contents
1. [Product Vision & Philosophy](#product-vision--philosophy)
2. [Key Capabilities](#key-capabilities)
3. [Architecture Overview](#architecture-overview)
4. [Database Entity-Relationship Model (Mermaid)](#database-entity-relationship-model)
5. [Prerequisites & Getting Started](#prerequisites--getting-started)
6. [Database Setup, Migrations & Seeding](#database-setup-migrations--seeding)
7. [Environment Variables Reference](#environment-variables-reference)
8. [API Endpoint Documentation](#api-endpoint-documentation)
9. [Child Safety, Privacy & DPDPA Review](#child-safety-privacy--dpdpa-review)
10. [Screen-Time Enforcement Architecture & Limitations](#screen-time-enforcement-architecture--limitations)
11. [Running Tests & Build Verification](#running-tests--build-verification)
12. [Post-MVP Prioritized Roadmap](#post-mvp-prioritized-roadmap)

---

## 1. Product Vision & Philosophy

**Chhota Genius** provides a clean, calm, distraction-free educational sanctuary for young children (ages 3–8) while giving parents complete sovereignty over what their children watch, how long they engage, and how rewards are earned.

### Core Principles
- **No Infinite Algorithmic Rabbits Holes:** Zero third-party ads, zero tracking scripts, no commercial promotions, and no unapproved video suggestions.
- **Parental Sovereignty:** Children can only access educational videos and interactive games explicitly approved by their parent or guardian.
- **Safe Virtual Rewards:** Virtual coins hold **no cash value** and cannot be transferred or purchased with real money. Coins are awarded strictly for completing verified educational activities (not passive watch time) and can only be exchanged for **parent-approved offline real-world treats** (e.g., family park visits, bedtime story picks, art supplies).
- **Server-Authoritative Fairness:** Coin balances, answer validations, and screen-time session clocks are calculated and verified exclusively on the server to prevent manipulation or duplicate farming.
- **No Shaming:** Wrong answers never deduct coins or shame young learners. Children are encouraged to retry and build confidence.

---

## 2. Key Capabilities

| Domain | Key Capabilities |
|---|---|
| **Landing Page** | Honest educational benefits, safety disclosures, parental advisory notice, and DPDPA 2023 child privacy overview. |
| **Parent Authentication** | Secure registration, login, session management via HttpOnly SameSite cookies (`jose` JWT/HMAC), bcryptjs password hashing, and endpoint rate limiting. |
| **Child Profiles** | Display nicknames only; developmental age bands (3–5 and 6–8); preferred language (English or Hindi); server-side ownership enforcement on every request. |
| **Child Mode** | Dedicated high-contrast, playful interface with large touch targets (48px+), category carousels, child lock math gate (`7 + 5 = ?`), and "Ask Parent for Help" modal. |
| **Curated Video Library** | Curated educational video files; signed short-lived playback URLs with HMAC validation; MIME type and magic-byte signature validation; sample development fallback mode. |
| **Interactive Activities** | Server-verified quizzes, matching, and sorting activities; secret answers kept on the server; positive feedback without shaming; duplicate claim prevention. |
| **Coin Ledger & Rewards** | Immutable append-only ledger; idempotency keys preventing double-spending; parent approval required for every offline reward redemption. |
| **Screen-Time Controls** | Server clock session tracking with periodic heartbeats; bounded client delta increments; automatic playback pause and cheerful session-end screen upon limit reach. |

---

## 3. Architecture Overview

```mermaid
flowchart TD
    Client["Client Devices (Desktop, Tablet, Mobile)"]
    
    subgraph Edge_Middleware["Next.js App Router (Port 3000)"]
        PublicRoutes["Public Pages: /, /login, /register, /privacy"]
        ParentRoutes["Parent Zone: /parent/dashboard, /children, /content, /rewards"]
        ChildRoutes["Child Sandbox: /child/:id, /activity/:id, /watch/:id, /rewards"]
        APIRoutes["Route Handlers: /api/auth, /api/parent, /api/child, /api/content"]
    end

    subgraph Service_Layer["Authoritative Core Services (Strict Server Validation)"]
        AuthService["Auth & Session Service (bcryptjs, jose, rateLimiter)"]
        ChildrenService["Children Profile Service (Ownership Guards)"]
        ContentService["Content Service (Signed Tokens, Approval Engine)"]
        LearningService["Learning Engine (Server Scoring, Anti-Farming)"]
        RewardsService["Authoritative Coin Ledger & Redemption Service"]
        ScreenService["Screen-Time Controller (Heartbeats, Server Clock)"]
    end

    subgraph Persistence_Layer["Data & Storage Layer"]
        PrismaORM["Prisma Client ORM (PostgreSQL)"]
        PostgresDB[("PostgreSQL Database (10 Normalized Models)")]
        StorageEngine["Object Storage (Local Disk / S3 Signed URLs)"]
        ResilientFallback["In-Memory Mock Store (Zero-Setup Dev & Test Mode)"]
    end

    Client --> PublicRoutes
    Client --> ParentRoutes
    Client --> ChildRoutes
    
    PublicRoutes --> APIRoutes
    ParentRoutes --> APIRoutes
    ChildRoutes --> APIRoutes

    APIRoutes --> AuthService
    APIRoutes --> ChildrenService
    APIRoutes --> ContentService
    APIRoutes --> LearningService
    APIRoutes --> RewardsService
    APIRoutes --> ScreenService

    AuthService --> PrismaORM
    ChildrenService --> PrismaORM
    ContentService --> PrismaORM
    LearningService --> PrismaORM
    RewardsService --> PrismaORM
    ScreenService --> PrismaORM

    PrismaORM -.->|Active DB Connection| PostgresDB
    PrismaORM -.->|Offline / Fallback| ResilientFallback
    ContentService --> StorageEngine
```

---

## 4. Database Entity-Relationship Model

```mermaid
erDiagram
    Parent ||--o{ Child : "has children (1:N)"
    Parent ||--o{ Reward : "configures catalogue (1:N)"
    Parent ||--o{ ParentContentApproval : "approves content (1:N)"

    Child ||--o{ ParentContentApproval : "has approvals (1:N)"
    Child ||--o{ LearningAttempt : "attempts activities (1:N)"
    Child ||--o{ CoinTransaction : "owns ledger transactions (1:N)"
    Child ||--o{ RewardRedemption : "requests redemptions (1:N)"
    Child ||--o{ ScreenSession : "logs screen sessions (1:N)"

    ContentItem ||--o{ ParentContentApproval : "approval records (1:N)"
    ContentItem ||--o{ LearningActivity : "has companion activities (1:N)"

    LearningActivity ||--o{ LearningAttempt : "attempt history (1:N)"
    LearningAttempt ||--o| CoinTransaction : "awards coins (1:1)"

    Reward ||--o{ RewardRedemption : "redeemed by children (1:N)"
    RewardRedemption ||--o| CoinTransaction : "deducts coins (1:1)"

    Parent {
        string id PK
        string email UK
        string passwordHash
        string name
        string role
        int dailyScreenTimeMinutesDefault
        int sessionBreakReminderMinutes
        int monthlyRewardCoinBudget
        datetime createdAt
        datetime updatedAt
    }

    Child {
        string id PK
        string parentId FK
        string name
        string avatar
        AgeBand ageBand
        Language preferredLanguage
        int dailyScreenTimeMinutes
        int breakReminderMinutes
        datetime createdAt
        datetime updatedAt
    }

    ContentItem {
        string id PK
        string title
        string description
        ContentCategory category
        Language language
        AgeBand ageBand
        int durationSeconds
        PublicationStatus publicationStatus
        string storageKey
        string thumbnailKey
        string uploader
        boolean isSampleContent
        datetime createdAt
        datetime updatedAt
    }

    ParentContentApproval {
        string id PK
        string parentId FK
        string childId FK
        string contentItemId FK
        ApprovalStatus status
        datetime decidedAt
    }

    LearningActivity {
        string id PK
        string contentItemId FK
        string title
        string description
        ActivityType activityType
        AgeBand ageBand
        Language language
        ContentCategory category
        string instructions
        int coinReward
        string questionsData
        datetime createdAt
        datetime updatedAt
    }

    LearningAttempt {
        string id PK
        string childId FK
        string activityId FK
        AttemptStatus status
        int score
        int maxScore
        boolean passed
        boolean rewardAwarded
        string answersData
        datetime startedAt
        datetime completedAt
    }

    CoinTransaction {
        string id PK
        string childId FK
        int amount
        TransactionType type
        string reason
        string idempotencyKey UK
        string learningAttemptId FK
        string redemptionId FK
        datetime createdAt
    }

    Reward {
        string id PK
        string parentId FK
        string title
        string description
        string category
        int coinCost
        string icon
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    RewardRedemption {
        string id PK
        string childId FK
        string rewardId FK
        int coinCost
        RedemptionStatus status
        string parentNote
        datetime requestedAt
        datetime decidedAt
    }

    ScreenSession {
        string id PK
        string childId FK
        string sessionToken UK
        datetime startedAt
        datetime lastHeartbeatAt
        datetime endedAt
        int durationSeconds
        boolean isActive
    }
```

---

## 5. Prerequisites & Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or higher (verified on Node.js `v24.13.1`)
- **npm**: `v9.0.0` or higher (verified on npm `11.8.0`)
- **PostgreSQL**: `v14+` (Optional for local review: the application includes an instant, zero-setup in-memory store initialized with realistic development seed data if PostgreSQL is not running locally).

### Quickstart Installation

1. **Clone or navigate into the project directory:**
   ```bash
   cd chhota-genius
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Database Setup, Migrations & Seeding

### When Running PostgreSQL Locally or in Docker
To run PostgreSQL locally via Docker:
```bash
docker run --name chhota-genius-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=chhota_genius -p 5432:5432 -d postgres:16-alpine
```

Set your `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chhota_genius?schema=public"
```

Apply migrations and seed sample data:
```bash
# Push schema or apply versioned migrations
npm run prisma:push

# Execute seed script with fictional test accounts
npm run prisma:seed
```

### Seeded Development Accounts
The seed script populates clearly labelled fictional test data:
- **Demo Parent Email:** `parent.demo@chhotagenius.local`
- **Demo Parent Password:** `ChhotaGenius@2026`
- **Preconfigured Children:**
  - `Aarav` (Age 3–5 Band, English, 25 mins daily screen time, 15 coins)
  - `Ananya` (Age 6–8 Band, Hindi, 35 mins daily screen time, 20 coins)
- **6 Curated Educational Videos** (Alphabets, Math, Science, Art, Hindi Phonics, Good Habits)
- **4 Interactive Activities** (Quizzes, Matching Pairs, Sorting Box)
- **4 Parent Offline Rewards** (Family Park Visit, Storybook Pick, Crayons Pack, Cookie Baking)

---

## 7. Environment Variables Reference

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `DATABASE_URL` | Yes (in prod) | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/chhota_genius?schema=public` |
| `AUTH_SECRET` | Yes | 32+ character HMAC key for signing HttpOnly JWT session tokens | `openssl rand -base64 32` |
| `NODE_ENV` | No | Execution environment (`development`, `production`, `test`) | `development` |
| `NEXT_PUBLIC_APP_URL` | No | Base application URL | `http://localhost:3000` |
| `STORAGE_DRIVER` | No | Media storage engine (`local` or `s3`) | `local` |
| `LOCAL_STORAGE_DIR` | No | Path for uploaded video media in local dev | `./public/uploads` |

---

## 8. API Endpoint Documentation

### Authentication Endpoints

#### `POST /api/auth/register`
Creates a new parent account and sets a signed HttpOnly session cookie.
- **Request Body:**
  ```json
  {
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "password": "SecurePassword123",
    "consentPrivacy": true
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Account created successfully",
    "parent": {
      "id": "parent_clx...",
      "email": "priya@example.com",
      "name": "Priya Sharma",
      "role": "PARENT",
      "dailyScreenTimeMinutesDefault": 30
    }
  }
  ```

#### `POST /api/auth/login`
Authenticates parent with rate-limit protection (max 5 attempts per 15 minutes).
- **Request Body:**
  ```json
  {
    "email": "parent.demo@chhotagenius.local",
    "password": "ChhotaGenius@2026"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "parent": { "id": "parent_demo_01", "name": "Priya Sharma (Demo Parent)" }
  }
  ```

---

### Children Profiles & Content Curation

#### `GET /api/parent/children`
Returns all child profiles owned by the authenticated parent, including live coin balances.

#### `POST /api/parent/children`
Creates a child profile with minimal data (nickname and age band). Auto-approves matching age-band content.
- **Request Body:**
  ```json
  {
    "name": "Aarav",
    "avatar": "lion",
    "ageBand": "BAND_3_5",
    "preferredLanguage": "ENGLISH",
    "dailyScreenTimeMinutes": 25,
    "breakReminderMinutes": 15
  }
  ```

#### `POST /api/parent/children/:id/approvals`
Approves or revokes access to an educational video for a specific child.
- **Request Body:**
  ```json
  {
    "contentItemId": "content-abc-phonics",
    "approved": true
  }
  ```

---

### Interactive Activities & Rewards Ledger

#### `GET /api/child/:id/activities`
Returns sanitized learning activities. **Secret answer keys and explanations are stripped server-side.**

#### `POST /api/child/:id/activities`
Evaluates submission against server-stored answers. Enforces idempotency to prevent duplicate reward farming.
- **Request Body:**
  ```json
  {
    "activityId": "act-abc-quiz-1",
    "answers": { "q1": "opt1", "q2": "opt2" }
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "score": 2,
    "maxScore": 2,
    "passed": true,
    "rewardAwarded": true,
    "coinsEarned": 5,
    "newBalance": 15,
    "feedback": {
      "message": "🎉 Amazing work! You scored 2/2 and earned +5 Chhota Coins!"
    }
  }
  ```

#### `POST /api/child/:id/rewards`
Child requests redemption of a parent-configured offline reward. Checks server balance before creating request.
- **Request Body:**
  ```json
  { "rewardId": "reward-park-visit" }
  ```

#### `POST /api/parent/redemptions`
Parent approves or rejects a reward redemption request. Deducts coins atomically upon approval.
- **Request Body:**
  ```json
  {
    "redemptionId": "redemption_1729...",
    "decision": "APPROVE",
    "parentNote": "Have fun at the park tomorrow!"
  }
  ```

---

### Screen-Time Session Control

#### `POST /api/child/:id/screentime`
Initializes or resumes a screen session. Checks total time spent today against daily limit.
- **Response (200 OK):**
  ```json
  {
    "allowed": true,
    "sessionToken": "ses_9a7f...",
    "remainingSeconds": 1500,
    "breakReminderMinutes": 15
  }
  ```

#### `PUT /api/child/:id/screentime`
Heartbeat ping every 30 seconds. Bounds client delta to prevent timer manipulation. Returns session status and break alert.

---

## 9. Child Safety, Privacy & DPDPA Review

Chhota Genius is architected around the strictest child data privacy guidelines, reflecting the principles of India's **Digital Personal Data Protection Act, 2023 (DPDPA)** and international COPPA/GDPR-K best practices:

1. **Strict Data Minimization:** We do not collect children's legal full names, exact dates of birth, geographic GPS locations, biometric identifiers, photos, audio recordings, or camera feeds.
2. **Parental Consent Architecture:** Child accounts can only be provisioned by authenticated parents who provide explicit consent at registration.
3. **Zero Third-Party Advertising:** No commercial advertising SDKs, behavioural trackers, or tracking pixels exist in the codebase.
4. **No Automated Profiling:** We do not build psychological or behavioural profiles of children, nor do we deploy algorithmic rabbit holes.
5. **Right to Erasure:** Deleting a child profile or parent account triggers database cascade deletion, instantly purging all session records, attempts, and transaction logs.

---

## 10. Screen-Time Enforcement Architecture & Limitations

### How It Works
1. **Server Clock Authority:** Each screen session generates a cryptographic session token. Every 30 seconds, a heartbeat ping updates server duration.
2. **Anti-Tampering Deliberation:** The server derives actual elapsed time from `now() - session.lastHeartbeatAt` and clamps client deltas to a maximum of 60 seconds.
3. **Session Re-Entry Prevention:** Once the sum of today's session durations reaches the parent-configured limit, all subsequent attempts to initialize sessions return `{ allowed: false, remainingSeconds: 0 }`.

### Transparent Engineering Limitations
- **Browser-Level Sandbox:** This web application cannot control the underlying operating system or other browser applications. If a child closes the browser or switches to another game, server enforcement pauses. Complete device-level enforcement requires device-level parental controls (e.g. Apple Screen Time or Google Family Link) in tandem with parental co-engagement.
- **No Medical Claims:** Screen-time controls and break reminders are pedagogical aids designed to foster healthy habits; they do not constitute medical intervention or guaranteed prevention of visual strain.

---

## 11. Running Tests & Build Verification

The project includes unit, integration, and end-to-end tests covering all critical invariants.

### 1. Run Unit & Integration Test Suite (Vitest)
```bash
npm test
```
**Test Coverage Breakdown (28 passing tests):**
- `tests/auth.test.ts`: Zod schema validation, bcrypt password hashing, JWT session signing & verification, rate-limiter logic.
- `tests/authorization.test.ts`: Cross-account access denial, parent ownership guards on child CRUD and reward approvals.
- `tests/content.test.ts`: Age band filtering, publication status filtering, signed HMAC token verification, MIME type and magic-byte validation.
- `tests/learning.test.ts`: Secret answer hiding, server scoring, passing thresholds, anti-farming duplicate claim prevention, zero coin penalty on mistakes.
- `tests/rewards-ledger.test.ts`: Authoritative balance derivation, insufficient balance rejection, atomic parent approval deduction, idempotency protection.
- `tests/screentime.test.ts`: Daily limit enforcement, timer manipulation bounding, playback termination, parent summary.
- `tests/e2e-flow.test.ts`: Complete user journey from parent registration to reward redemption approval.

### 2. Run TypeScript Strict Compilation Check
```bash
npx tsc --noEmit
```

### 3. Run Production Build
```bash
npm run build
```

---

## 12. Post-MVP Prioritized Roadmap

For commercial multi-tenant distribution, the following enhancements are prioritized:
1. **Private S3 / Cloudflare R2 Upload Pipeline:** Expand the media storage driver with direct signed presigned upload URLs and asynchronous transcoding (HLS / DASH with FFmpeg).
2. **Audio Narration Engine:** Add offline-first Text-to-Speech audio prompts for non-reading children in Hindi and regional Indian languages.
3. **Native Mobile Shell:** Package the responsive web application using Capacitor / React Native for Android TV and mobile tablet kiosk mode.
4. **Third-Party Security Audit:** Conduct external penetration testing and independent legal verification for DPDPA enterprise compliance.
