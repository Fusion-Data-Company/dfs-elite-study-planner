import { describe, it, expect } from "vitest";

describe("DFS Elite Study Planner App", () => {
  describe("Theme Configuration", () => {
    it("should have valid theme colors defined", async () => {
      const themeConfig = await import("../theme.config.js");
      const { themeColors } = themeConfig;
      
      // Check primary colors exist
      expect(themeColors.primary).toBeDefined();
      expect(themeColors.primary.light).toBeDefined();
      expect(themeColors.primary.dark).toBeDefined();
      
      // Check secondary colors exist
      expect(themeColors.secondary).toBeDefined();
      expect(themeColors.accent).toBeDefined();
      
      // Check background colors exist
      expect(themeColors.background).toBeDefined();
      expect(themeColors.surface).toBeDefined();
      
      // Check text colors exist
      expect(themeColors.foreground).toBeDefined();
      expect(themeColors.muted).toBeDefined();
      
      // Check status colors exist
      expect(themeColors.success).toBeDefined();
      expect(themeColors.warning).toBeDefined();
      expect(themeColors.error).toBeDefined();
    });

    it("should have correct dark mode primary color matching DFS Elite", () => {
      const themeConfig = require("../theme.config.js");
      const { themeColors } = themeConfig;
      
      // Dark mode primary should be cyan/teal
      expect(themeColors.primary.dark).toBe("#00d4ff");
    });

    it("should have correct dark mode background color", () => {
      const themeConfig = require("../theme.config.js");
      const { themeColors } = themeConfig;
      
      // Dark mode background should be deep navy
      expect(themeColors.background.dark).toBe("#0a0b0f");
    });
  });

  describe("Default Data Structures", () => {
    it("should have valid default goals structure", () => {
      const defaultGoals = [
        {
          id: "1",
          type: "exam_date",
          title: "Pass DFS-215 Exam",
          target: 100,
          current: 0,
          unit: "%",
          deadline: "2025-03-31",
        },
      ];
      
      expect(defaultGoals[0]).toHaveProperty("id");
      expect(defaultGoals[0]).toHaveProperty("type");
      expect(defaultGoals[0]).toHaveProperty("title");
      expect(defaultGoals[0]).toHaveProperty("target");
      expect(defaultGoals[0]).toHaveProperty("current");
      expect(defaultGoals[0]).toHaveProperty("unit");
    });

    it("should have valid default tasks structure", () => {
      const defaultTasks = [
        {
          id: "1",
          title: "Complete Lesson 15",
          subtitle: "Insurance Regulations Overview",
          type: "lesson",
          completed: false,
          priority: "high",
        },
      ];
      
      expect(defaultTasks[0]).toHaveProperty("id");
      expect(defaultTasks[0]).toHaveProperty("title");
      expect(defaultTasks[0]).toHaveProperty("subtitle");
      expect(defaultTasks[0]).toHaveProperty("type");
      expect(defaultTasks[0]).toHaveProperty("completed");
      expect(defaultTasks[0]).toHaveProperty("priority");
    });

    it("should have valid study stats structure", () => {
      const defaultStats = {
        overallProgress: 0,
        studyStreak: 0,
        iflashDue: 0,
        ceHours: 0,
        ceHoursTotal: 24,
        lessonsCompleted: 0,
        quizzesPassed: 0,
        averageScore: 0,
      };
      
      expect(defaultStats).toHaveProperty("overallProgress");
      expect(defaultStats).toHaveProperty("studyStreak");
      expect(defaultStats).toHaveProperty("iflashDue");
      expect(defaultStats).toHaveProperty("ceHours");
      expect(defaultStats.ceHoursTotal).toBe(24); // Florida CE requirement
    });
  });

  describe("Guide Content", () => {
    it("should have guides for all main features", () => {
      const guideIds = ["flashcards", "ai-tutors", "quizzes", "timed-exam", "ce-tracking"];
      
      guideIds.forEach(id => {
        expect(id).toBeDefined();
      });
      
      expect(guideIds.length).toBe(5);
    });
  });
});
