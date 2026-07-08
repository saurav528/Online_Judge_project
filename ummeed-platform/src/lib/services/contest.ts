import { prisma } from "@/lib/prisma";

const PENALTY_PER_WRONG = 20; // minutes per wrong submission before AC

export class ContestService {
  /**
   * List all published contests ordered by startTime descending.
   */
  static async listContests() {
    return prisma.contest.findMany({
      where: { published: true },
      include: {
        problems: {
          include: { problem: { select: { id: true, title: true, difficulty: true, slug: true } } },
          orderBy: { sequence: "asc" },
        },
        _count: { select: { participants: true } },
      },
      orderBy: { startTime: "desc" },
    });
  }

  /**
   * Get a single contest with full problem details.
   */
  static async getContest(id: string) {
    return prisma.contest.findUnique({
      where: { id },
      include: {
        problems: {
          include: { problem: { select: { id: true, title: true, slug: true, difficulty: true, timeLimit: true, memoryLimit: true } } },
          orderBy: { sequence: "asc" },
        },
        _count: { select: { participants: true } },
      },
    });
  }

  /**
   * Check if a user is registered for a contest.
   */
  static async isRegistered(contestId: string, userId: string): Promise<boolean> {
    const record = await prisma.contestParticipant.findUnique({
      where: { contestId_userId: { contestId, userId } },
    });
    return !!record;
  }

  /**
   * Register a user for a contest (idempotent upsert).
   */
  static async registerParticipant(contestId: string, userId: string) {
    return prisma.contestParticipant.upsert({
      where: { contestId_userId: { contestId, userId } },
      create: { contestId, userId, score: 0, penalty: 0 },
      update: {},
    });
  }

  /**
   * Recalculate and update a participant's score and penalty from scratch.
   * Called after each contest submission is judged.
   *
   * Scoring (ICPC-style):
   *  - Each problem solved (first AC) earns its full ContestProblem.points.
   *  - Each WA before first AC adds PENALTY_PER_WRONG minutes of penalty.
   */
  static async recalculateScore(contestId: string, userId: string) {
    // Fetch all this user's submissions for this contest, in submission time order
    const submissions = await prisma.submission.findMany({
      where: { contestId, userId, status: "COMPLETED" },
      orderBy: { submittedAt: "asc" },
    });

    // Get problem points mapping
    const contestProblems = await prisma.contestProblem.findMany({
      where: { contestId },
    });
    const pointsMap: Record<string, number> = {};
    for (const cp of contestProblems) {
      pointsMap[cp.problemId] = cp.points;
    }

    // Group by problem
    const byProblem: Record<string, typeof submissions> = {};
    for (const sub of submissions) {
      if (!byProblem[sub.problemId]) byProblem[sub.problemId] = [];
      byProblem[sub.problemId].push(sub);
    }

    let totalScore = 0;
    let totalPenalty = 0;

    for (const [problemId, subs] of Object.entries(byProblem)) {
      let wrongs = 0;
      let solved = false;
      for (const sub of subs) {
        if (sub.verdict === "ACCEPTED") {
          totalScore += pointsMap[problemId] ?? 100;
          totalPenalty += wrongs * PENALTY_PER_WRONG;
          solved = true;
          break;
        } else if (
          sub.verdict === "WRONG_ANSWER" ||
          sub.verdict === "RUNTIME_ERROR" ||
          sub.verdict === "TLE" ||
          sub.verdict === "COMPILATION_ERROR"
        ) {
          wrongs++;
        }
      }
      void solved; // suppress unused-var warning
    }

    await prisma.contestParticipant.update({
      where: { contestId_userId: { contestId, userId } },
      data: { score: totalScore, penalty: totalPenalty },
    });
  }

  /**
   * Compute and return the full leaderboard for a contest.
   * Returns participants sorted by score DESC, then penalty ASC.
   */
  static async getLeaderboard(contestId: string) {
    const [participants, contestProblems] = await Promise.all([
      prisma.contestParticipant.findMany({
        where: { contestId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: [{ score: "desc" }, { penalty: "asc" }],
      }),
      prisma.contestProblem.findMany({
        where: { contestId },
        include: { problem: { select: { id: true, title: true, slug: true } } },
        orderBy: { sequence: "asc" },
      }),
    ]);

    // For each participant, build a per-problem status map
    const allSubmissions = await prisma.submission.findMany({
      where: {
        contestId,
        userId: { in: participants.map((p) => p.userId) },
        status: "COMPLETED",
      },
      orderBy: { submittedAt: "asc" },
    });

    type ProblemStatus = {
      solved: boolean;
      attempts: number;
      penaltyMinutes: number;
    };

    // userId -> problemId -> status
    const statusMap: Record<string, Record<string, ProblemStatus>> = {};
    for (const sub of allSubmissions) {
      if (!statusMap[sub.userId]) statusMap[sub.userId] = {};
      const ps = statusMap[sub.userId][sub.problemId];
      if (!ps) {
        statusMap[sub.userId][sub.problemId] = {
          solved: sub.verdict === "ACCEPTED",
          attempts: 1,
          penaltyMinutes: sub.verdict !== "ACCEPTED" ? PENALTY_PER_WRONG : 0,
        };
      } else if (!ps.solved) {
        if (sub.verdict === "ACCEPTED") {
          ps.solved = true;
        } else {
          ps.attempts++;
          ps.penaltyMinutes += PENALTY_PER_WRONG;
        }
      }
    }

    return {
      problems: contestProblems,
      rows: participants.map((p, idx) => ({
        rank: idx + 1,
        userId: p.userId,
        name: p.user.name,
        email: p.user.email,
        score: p.score,
        penalty: p.penalty,
        problemStatuses: contestProblems.map((cp) => {
          const st = statusMap[p.userId]?.[cp.problemId];
          return {
            problemId: cp.problemId,
            solved: st?.solved ?? false,
            attempts: st?.attempts ?? 0,
            penaltyMinutes: st?.penaltyMinutes ?? 0,
          };
        }),
      })),
    };
  }
}
