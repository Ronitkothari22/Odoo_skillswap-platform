# Skill Swap Platform – Backend Task List (Supabase)


> **Backend focus:** Node / Express (API) + Supabase (PostgreSQL)  
> **Goal:** Ship a working MVP REST API that the front-end can consume.

## 📄 Project Description
The **Skill Swap Platform** is a decentralized, peer-to-peer application that treats _knowledge as a currency_. It enables users to list the skills they can teach, discover others with complementary interests, and initiate mutually beneficial learning exchanges — all without monetary transactions.

### Core Functionalities
1. **User Onboarding & Profile Management** – Create profiles, list skills offered/wanted, set availability, and control profile visibility.
2. **Skill Discovery & Intelligent Matching** – Search users by skills & availability; algorithmically suggest reciprocal matches.
3. **Swap Request Workflow** – Send, accept, cancel, or track skill-swap requests with clear status categories.
4. **Feedback & Trust System** – Post-swap star ratings and reviews to build community reputation.
5. **Administrative Control Panel** – Moderation tools, analytics, and global announcements to keep the ecosystem healthy.

By removing financial barriers and promoting reciprocal growth, the platform empowers communities to learn, teach, and thrive together.

---

## ✅ Detailed Task Checklist

### 1. Environment & Tooling
- [ ] Spin up **Supabase project**; record `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SERVICE_ROLE_KEY`.
- [ ] Scaffold **Node/Express** API (TypeScript preferred) with `ts-node-dev` & ESLint.
- [ ] Add **Supabase JS client** & **dotenv** for secrets management.
- [ ] Create GitHub repo & enable GitHub Actions (CI on push & `npm test`).

### 2. Database Modeling (Supabase / Postgres)
- [ ] Tables:
  - `users` (id, name, location, avatar_url, visibility, created_at)
  - `skills` (id, name UNIQUE)
  - `user_skills` (user_id, skill_id, proficiency INT)
  - `desired_skills` (user_id, skill_id, priority INT)
  - `availability_slots` (user_id, weekday, start_time, end_time)
  - `swap_requests` (id, requester_id, responder_id, give_skill_id, take_skill_id, status ENUM(pending, accepted, cancelled), created_at)
  - `feedback` (id, swap_id, from_user_id, to_user_id, stars INT, comment, created_at)
  - `admin_logs` (id, actor_id, action_type, target_id, details, created_at)
- [ ] Create **SQL migration scripts** via Supabase CLI.
- [ ] Enable **Row-Level Security (RLS)** & craft policies for each table.

### 3. Authentication & Authorization
- [ ] Enable Supabase **Email/Password auth** (magic link fallback).
- [ ] Configure JWT validation middleware in Express.
- [ ] Expose `POST /auth/signup` & `POST /auth/login` helper endpoints.

### 4. Profile Management
- [ ] `GET /profile` → fetch own profile incl. skills & availability.
- [ ] `PATCH /profile` → update name, location, avatar, visibility.
- [ ] `POST /profile/skills` → add/update offered skills.
- [ ] `POST /profile/desired-skills` → add/update desired skills.
- [ ] `POST /profile/availability` → set availability slots.

### 5. Skill Discovery & Intelligent Matching
- [ ] `GET /users` with query params `skill`, `availability`, `visibility`.
- [ ] Implement Postgres **full-text index** on `skills.name` for quick search.
- [ ] `GET /matches` → return users whose **desired** skill intersects with my **offered** skill & vice-versa.

### 6. Swap Request Workflow
- [ ] `POST /swaps` → initiate swap (payload: give_skill_id, take_skill_id, target_user_id).
- [ ] `PATCH /swaps/:id` → accept / reject / cancel.
- [ ] `DELETE /swaps/:id` → withdraw a pending request before it’s accepted.
- [ ] `GET /swaps` → list filtered by `status` (pending/accepted/cancelled).
- [ ] Webhook / real-time channel via Supabase **realtime** to push status updates.

### 7. Feedback & Trust System
- [ ] `POST /feedback` (payload: swap_id, stars, comment).
- [ ] `GET /feedback/:userId` → aggregate rating for a user (avg stars, review snippets).
- [ ] DB trigger: after new feedback, recalculate & store user’s `rating_avg`.

### 8. Administrative Control Panel API
- [ ] JWT role check: only `role = admin` can access admin routes.
- [ ] `GET /admin/swaps?status=pending` → monitor transactions.
- [ ] `PATCH /admin/skill-listings/:id/reject`.
- [ ] `PATCH /admin/users/:id/ban`.
- [ ] `POST /admin/broadcast` → push global message via Supabase **Edge Functions**.
- [ ] `GET /admin/analytics` → return stats: active users, feedback count, swap count.
- [ ] `GET /admin/reports?type=swaps|activity|feedback` → downloadable CSV/JSON reports for audits & insights.

### 9. Cross-Cutting Concerns
- [ ] Centralized **error handler** & **logger** (winston / pino).
- [ ] Input validation with **Zod** or **Joi**.
- [ ] Rate limiting (e.g., `express-rate-limit`) on public endpoints.
- [ ] CORS setup for front-end domain.

### 10. Testing & Documentation
- [ ] Unit tests for services (Jest).
- [ ] Integration tests hitting Supabase **local dev DB** (supabase start).
- [ ] Generate **OpenAPI (Swagger)** spec automatically from routes.
- [ ] Postman collection / Insomnia export for manual QA.

### 11. Deployment
- [ ] Deploy API to **Render / Fly.io / Railway** (pick quickest).
- [ ] Add environment variables & health check.
- [ ] Update README with base URL + example requests.

### 12. Swap Chat (Stretch Goal)
- [ ] **Table `swap_messages`** (id, swap_id FK, sender_id FK, content TEXT, created_at).
- [ ] **Row-Level Security**: only users involved in the related `swap_requests` row (accepted status) can `SELECT`/`INSERT`.
- [ ] `GET /swaps/:id/messages` → paginated chat history (query: `cursor` or `limit`).
- [ ] `POST /swaps/:id/messages` → send a new message (`{content}`).
- [ ] **Realtime channel**: subscribe to `swap_messages` where `swap_id = :id` so both parties receive live updates.
- [ ] Optional trigger: maintain `unread_count` per user in `swap_requests`.


