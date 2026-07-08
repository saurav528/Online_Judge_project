# Contest Feature — Implementation Plan

## Overview

Add a full Contest module to the Ummeed platform. Students can browse upcoming/running/ended contests, register, solve problems within a contest context, and view a **post-contest leaderboard** ranked by score and penalty. 3 seed contests will be added using the existing 12 problems.

---

## Key Design Decisions

> [!IMPORTANT]
> **Synchronous Execution**: Since we already switched to Judge0 `wait=true`, submissions inside contests will also resolve synchronously — no polling needed on the frontend.

> [!IMPORTANT]
> **Scoring Formula**: ICPC-style scoring will be used:
> - Each problem has a base **point value** (already in `ContestProblem.points`).
> - A student earns the full points on first Accepted submission.
> - **Penalty** = number of wrong submissions before AC × 20 minutes (ICPC standard).
> - Leaderboard ranks by: **total score DESC**, then **total penalty ASC**.

> [!NOTE]
> **Post-contest only leaderboard** for now (no real-time updates). The leaderboard page will be a static server-rendered page that recalculates from the database on each request.

---

## Proposed Changes

### 1. Database — Seed Contests

#### [MODIFY] [seed.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/prisma/seed.ts)
- Add 3 contest objects at the end of the seed `main()` function.
- **Contest A – "Beginner Blitz"**: 4 EASY problems, already ended (status: ENDED).
- **Contest B – "Weekend Warrior"**: 4 mixed problems, currently running.
- **Contest C – "The Grand Challenge"**: 4 problems including MEDIUM/HARD, upcoming.
- Each `ContestProblem` will assign a `sequence` (A, B, C, D) and a `points` value.
- Seed also auto-registers the existing `student@ummeed.org` user in the ENDED contest with a realistic score/penalty to demonstrate the leaderboard.

---

### 2. Server-side Service — Contest Logic

#### [NEW] `src/lib/services/contest.ts`
A dedicated service class `ContestService` with:
- `listContests()` — fetch all published contests ordered by startTime DESC.
- `getContest(id)` — fetch one contest with its problems (including problem metadata).
- `getLeaderboard(contestId)` — compute leaderboard from `ContestParticipant` + `Submission` tables. Calculates total score and penalty per participant and returns a sorted array.
- `registerParticipant(contestId, userId)` — upsert a `ContestParticipant` record.
- `isRegistered(contestId, userId)` — check if user is already registered.

---

### 3. Submission Service — Contest Awareness

#### [MODIFY] [submission.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/services/submission.ts)
- Update `CreateSubmissionInput` to accept an optional `contestId`.
- When a contest submission is Accepted, update `ContestParticipant.score` and `ContestParticipant.penalty` using a helper that re-aggregates from all contest submissions for that user.

#### [MODIFY] [executor.ts](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/lib/services/executor.ts)
- After saving the result, if `submission.contestId` is set, call a `recalculateContestScore(contestId, userId)` helper to update the participant's aggregate score/penalty in `ContestParticipant`.

---

### 4. API Routes

#### [NEW] `src/app/api/contests/route.ts`
- `GET` — Returns list of all published contests (used by the contests list page).

#### [NEW] `src/app/api/contests/[id]/register/route.ts`
- `POST` — Registers the authenticated user in a contest (creates `ContestParticipant` row). Only allowed if contest is UPCOMING or RUNNING.

#### [NEW] `src/app/api/contests/[id]/submit/route.ts`
- `POST` — Accepts `{ problemId, language, sourceCode }`, validates contest is RUNNING, user is registered, problem belongs to contest, then calls `SubmissionService.createSubmission` with `contestId` attached.

---

### 5. UI Pages

#### [NEW] `src/app/(protected)/contests/page.tsx` — **Contest Hub**
- Lists all contests in 3 sections: **Upcoming**, **Running**, **Ended**.
- Each contest card shows: title, dates, number of problems, status badge.
- Running/Upcoming contests show a "Register" or "Enter" button.
- Ended contests show a "View Leaderboard" button.

#### [NEW] `src/app/(protected)/contests/[id]/page.tsx` — **Contest Detail Page**
- Shows contest info, time remaining countdown (client component), problem list (A, B, C, D with points).
- If contest is RUNNING and user is registered: each problem links to a solve page.
- If contest is ENDED: problems are listed (read-only) + leaderboard button.

#### [NEW] `src/app/(protected)/contests/[id]/leaderboard/page.tsx` — **Post-Contest Leaderboard**
- Server-rendered table of all participants ranked by score (DESC), then penalty (ASC).
- Columns: Rank, Name, Total Score, Total Penalty, per-problem status (✓ / ✗ / —).
- Current user row is highlighted.

#### [NEW] `src/app/(protected)/contests/[id]/problems/[problemId]/page.tsx` — **In-Contest Problem Solver**
- Reuses the existing problem detail/code editor UI pattern.
- Locks submission if contest is not RUNNING or user is not registered.
- Submissions are tied to the contest via `contestId`.

---

### 6. Sidebar Navigation Update

#### [MODIFY] [sidebar.tsx](file:///c:/Users/saura/Desktop/Online_Judge_project/ummeed-platform/src/components/app-shell/sidebar.tsx)
- The "Contest Hub" link (`/contests`) already exists — no change needed here.

---

## Scoring Recalculation Logic

When executor finishes a contest submission:
1. Fetch all submissions for `(userId, problemId, contestId)`.
2. Find the **first AC submission** for each problem — that earns the full `ContestProblem.points`.
3. Count WA submissions **before** the first AC — each adds 20 min penalty.
4. Sum across all problems → update `ContestParticipant.score` and `ContestParticipant.penalty`.

---

## File Summary

| Action | File |
|--------|------|
| MODIFY | `prisma/seed.ts` |
| NEW    | `src/lib/services/contest.ts` |
| MODIFY | `src/lib/services/submission.ts` |
| MODIFY | `src/lib/services/executor.ts` |
| NEW    | `src/app/api/contests/route.ts` |
| NEW    | `src/app/api/contests/[id]/register/route.ts` |
| NEW    | `src/app/api/contests/[id]/submit/route.ts` |
| NEW    | `src/app/(protected)/contests/page.tsx` |
| NEW    | `src/app/(protected)/contests/[id]/page.tsx` |
| NEW    | `src/app/(protected)/contests/[id]/leaderboard/page.tsx` |
| NEW    | `src/app/(protected)/contests/[id]/problems/[problemId]/page.tsx` |

---

## Verification Plan

### Manual Testing Steps
1. Run `pnpm prisma db seed` → verify 3 contests appear in DB.
2. Browse `/contests` → verify Upcoming, Running, Ended sections render correctly.
3. Click into a Running contest → verify problem list, register button, and solver page.
4. Submit correct code → verify score updates in `ContestParticipant`.
5. Browse `/contests/[id]/leaderboard` → verify ranking order (score DESC, penalty ASC).
