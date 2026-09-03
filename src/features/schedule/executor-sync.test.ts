import { describe, it, expect } from "vitest";
import { canMemberExecuteSession } from "@/features/session-execution/engine";

describe("Admin & Assistant Coach Synchronization", () => {
  describe("canMemberExecuteSession with Session Executor concept", () => {
    it("allows Head Coach / Admin to execute any session or take over anytime", () => {
      expect(canMemberExecuteSession("head_coach", "head-coach-zulfi", "assistant-dani")).toBe(true);
      expect(canMemberExecuteSession("admin", "admin-1", "assistant-dani")).toBe(true);
      expect(canMemberExecuteSession("owner", "owner-1", "assistant-dani")).toBe(true);
    });

    it("allows Assistant Coach ONLY if their member ID matches the session executor / coach", () => {
      const assistantDaniId = "member-dani-123";
      const assistantLainId = "member-other-456";

      // Match executor -> allowed
      expect(canMemberExecuteSession("assistant_coach", assistantDaniId, assistantDaniId)).toBe(true);

      // Mismatch executor -> forbidden
      expect(canMemberExecuteSession("assistant_coach", assistantDaniId, assistantLainId)).toBe(false);
      expect(canMemberExecuteSession("assistant_coach", assistantDaniId, "head-coach-zulfi")).toBe(false);
    });

    it("strictly blocks athlete and parent roles from execution", () => {
      expect(canMemberExecuteSession("athlete", "ath-1", "ath-1")).toBe(false);
      expect(canMemberExecuteSession("parent", "parent-1", "parent-1")).toBe(false);
    });
  });

  describe("Athlete Assignment vs Session Executor separation", () => {
    it("differentiates assigned athlete coach from session executor", () => {
      const athleteA = {
        id: "ath-1",
        fullName: "Farras",
        assignedCoachId: "assistant-dani", // Supervised by Dani
      };

      const session1 = {
        id: "sess-1",
        coachId: "head-coach-zulfi",
        executorId: "head-coach-zulfi", // Executed by Head Coach
        athleteIds: [athleteA.id],
      };

      const session2 = {
        id: "sess-2",
        coachId: "head-coach-zulfi",
        executorId: "assistant-dani", // Delegated to Assistant Coach Dani
        athleteIds: [athleteA.id],
      };

      // Session 1 is executed by Head Coach Zulfi, even though athlete is supervised by Dani
      expect(session1.executorId).toBe("head-coach-zulfi");
      expect(canMemberExecuteSession("assistant_coach", "assistant-dani", session1.executorId)).toBe(false);

      // Session 2 is delegated to Dani
      expect(session2.executorId).toBe("assistant-dani");
      expect(canMemberExecuteSession("assistant_coach", "assistant-dani", session2.executorId)).toBe(true);
    });
  });
});
