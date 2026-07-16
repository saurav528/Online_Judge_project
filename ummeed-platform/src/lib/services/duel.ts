import { prisma } from "@/config/db";
import { DuelStatus, Verdict, Difficulty } from "@prisma/client";

export class DuelService {
  /**
   * Calculate new Elo ratings for two players
   */
  static calculateElo(winnerRating: number, loserRating: number, isDraw = false): { winnerNew: number; loserNew: number } {
    const K = 32;
    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

    const actualWinner = isDraw ? 0.5 : 1;
    const actualLoser = isDraw ? 0.5 : 0;

    const winnerNew = Math.round(winnerRating + K * (actualWinner - expectedWinner));
    const loserNew = Math.round(loserRating + K * (actualLoser - expectedLoser));

    return { winnerNew, loserNew };
  }

  /**
   * Finalize the duel when timer expires or someone gets 100/100 points
   */
  static async finalizeDuel(roomId: string, winnerId: string | null, isDraw = false) {
    const room = await prisma.duelRoom.findUnique({ where: { id: roomId } });
    if (!room || room.status !== DuelStatus.PLAYING) return;

    // Get ratings
    const p1 = await prisma.user.findUnique({ where: { id: room.player1Id } });
    const p2 = room.player2Id ? await prisma.user.findUnique({ where: { id: room.player2Id } }) : null;

    if (!p1 || !p2) return;

    let eloChanges = { p1New: p1.rating, p2New: p2.rating };

    if (isDraw) {
      const { winnerNew: p1New, loserNew: p2New } = this.calculateElo(p1.rating, p2.rating, true);
      eloChanges = { p1New, p2New };
    } else if (winnerId === room.player1Id) {
      const { winnerNew: p1New, loserNew: p2New } = this.calculateElo(p1.rating, p2.rating, false);
      eloChanges = { p1New, p2New };
    } else if (winnerId === room.player2Id) {
      const { winnerNew: p2New, loserNew: p1New } = this.calculateElo(p2.rating, p1.rating, false);
      eloChanges = { p1New, p2New };
    }

    // Update Duel Room & User ratings in a transaction
    await prisma.$transaction([
      prisma.duelRoom.update({
        where: { id: roomId },
        data: {
          status: DuelStatus.FINISHED,
          winnerId: isDraw ? null : winnerId,
        },
      }),
      prisma.user.update({
        where: { id: room.player1Id },
        data: { rating: eloChanges.p1New },
      }),
      prisma.user.update({
        where: { id: room.player2Id! },
        data: { rating: eloChanges.p2New },
      }),
    ]);
  }

  /**
   * Triggers after every submission runs in execution service.
   * Checks if user is in active duel for this problem and updates status.
   */
  static async handleSubmission(userId: string, problemId: string, verdict: Verdict) {
    if (verdict !== Verdict.ACCEPTED) return;

    const room = await prisma.duelRoom.findFirst({
      where: {
        status: DuelStatus.PLAYING,
        problemId,
        OR: [{ player1Id: userId }, { player2Id: userId }],
      },
    });

    if (!room) return;

    const isPlayer1 = room.player1Id === userId;

    // Update user score to 100 in the room
    await prisma.duelRoom.update({
      where: { id: room.id },
      data: isPlayer1 ? { player1Score: 100 } : { player2Score: 100 },
    });

    // If score is 100, this player solved it and wins the duel!
    await this.finalizeDuel(room.id, userId, false);
  }

  /**
   * Add a player to the queue and attempt matchmaking
   */
  static async joinQueue(userId: string, difficulty: Difficulty) {
    // 1. Upsert queue record
    await prisma.duelQueue.upsert({
      where: { userId },
      update: { difficulty },
      create: { userId, difficulty },
    });

    // 2. Look for another opponent in queue with same difficulty
    const opponent = await prisma.duelQueue.findFirst({
      where: {
        difficulty,
        userId: { not: userId },
      },
      orderBy: { joinedAt: "asc" },
    });

    if (!opponent) {
      return { matched: false };
    }

    // Match found! Select a random problem of matching difficulty
    const problems = await prisma.problem.findMany({
      where: { difficulty, published: true },
    });

    if (problems.length === 0) {
      throw new Error(`No published problems found for difficulty ${difficulty}`);
    }

    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    const now = new Date();
    const endsAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins duel

    // Create room and clean queue in transaction
    const room = await prisma.$transaction(async (tx) => {
      // Create Duel Room
      const newRoom = await tx.duelRoom.create({
        data: {
          status: DuelStatus.PLAYING,
          difficulty,
          player1Id: opponent.userId,
          player2Id: userId,
          problemId: randomProblem.id,
          startedAt: now,
          endsAt,
        },
      });

      // Remove both from queue
      await tx.duelQueue.deleteMany({
        where: { userId: { in: [userId, opponent.userId] } },
      });

      return newRoom;
    });

    return { matched: true, roomId: room.id };
  }

  /**
   * Remove user from matching queue
   */
  static async leaveQueue(userId: string) {
    await prisma.duelQueue.deleteMany({ where: { userId } });
  }

  /**
   * Get room status, automatically checking timer expiration
   */
  static async getRoomStatus(roomId: string, currentUserId: string): Promise<any> {
    const room = await prisma.duelRoom.findUnique({
      where: { id: roomId },
      include: {
        problem: { select: { title: true, slug: true, difficulty: true } },
      },
    });

    if (!room) return null;

    // Check timer expiration
    if (room.status === DuelStatus.PLAYING && room.endsAt && new Date() > new Date(room.endsAt)) {
      // Determine winner based on highest score
      let winnerId: string | null = null;
      let isDraw = false;

      if (room.player1Score > room.player2Score) winnerId = room.player1Id;
      else if (room.player2Score > room.player1Score) winnerId = room.player2Id;
      else isDraw = true;

      await this.finalizeDuel(room.id, winnerId, isDraw);

      // Re-fetch room state after finalizing
      return this.getRoomStatus(roomId, currentUserId);
    }

    // Fetch players profiles
    const [p1, p2] = await Promise.all([
      prisma.user.findUnique({ where: { id: room.player1Id }, select: { name: true, rating: true } }),
      room.player2Id ? prisma.user.findUnique({ where: { id: room.player2Id }, select: { name: true, rating: true } }) : null,
    ]);

    return {
      ...room,
      player1Name: p1?.name || "Player 1",
      player1Rating: p1?.rating || 1200,
      player2Name: p2?.name || "Searching...",
      player2Rating: p2?.rating || 1200,
      isPlayer1: currentUserId === room.player1Id,
      isPlayer2: currentUserId === room.player2Id,
    };
  }
}
