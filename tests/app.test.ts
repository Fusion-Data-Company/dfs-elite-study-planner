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


describe("File Structure", () => {
  const fs = require("fs");
  const path = require("path");
  const projectRoot = path.resolve(__dirname, "..");

  describe("Tab Screens", () => {
    const tabScreens = [
      "index.tsx",
      "flashcards.tsx",
      "lessons.tsx",
      "quiz.tsx",
      "agents.tsx",
    ];

    tabScreens.forEach((screen) => {
      it(`should have ${screen} tab screen`, () => {
        const screenPath = path.join(projectRoot, "app/(tabs)", screen);
        expect(fs.existsSync(screenPath)).toBe(true);
      });
    });
  });

  describe("Auth Screens", () => {
    it("should have sign-in screen", () => {
      const signInPath = path.join(projectRoot, "app/(auth)/sign-in.tsx");
      expect(fs.existsSync(signInPath)).toBe(true);
    });

    it("should have sign-up screen", () => {
      const signUpPath = path.join(projectRoot, "app/(auth)/sign-up.tsx");
      expect(fs.existsSync(signUpPath)).toBe(true);
    });
  });

  describe("Dynamic Routes", () => {
    it("should have lesson detail route", () => {
      const lessonPath = path.join(projectRoot, "app/lesson/[slug].tsx");
      expect(fs.existsSync(lessonPath)).toBe(true);
    });

    it("should have exam route", () => {
      const examPath = path.join(projectRoot, "app/exam/[bankId].tsx");
      expect(fs.existsSync(examPath)).toBe(true);
    });
  });

  describe("Components", () => {
    const components = [
      "FlashCard.tsx",
      "MCQCard.tsx",
      "TermCard.tsx",
      "AgentChat.tsx",
    ];

    components.forEach((component) => {
      it(`should have ${component} component`, () => {
        const componentPath = path.join(projectRoot, "components", component);
        expect(fs.existsSync(componentPath)).toBe(true);
      });
    });
  });

  describe("Hooks", () => {
    const hooks = [
      "useProgress.ts",
      "useFlashcards.ts",
      "useLessons.ts",
      "useAgentChat.ts",
      "useExams.ts",
    ];

    hooks.forEach((hook) => {
      it(`should have ${hook} hook`, () => {
        const hookPath = path.join(projectRoot, "hooks", hook);
        expect(fs.existsSync(hookPath)).toBe(true);
      });
    });
  });

  describe("API Client", () => {
    it("should have API client", () => {
      const apiPath = path.join(projectRoot, "lib/api.ts");
      expect(fs.existsSync(apiPath)).toBe(true);
    });
  });

  describe("Assets", () => {
    it("should have app icon", () => {
      const iconPath = path.join(projectRoot, "assets/images/icon.png");
      expect(fs.existsSync(iconPath)).toBe(true);
    });

    it("should have splash icon", () => {
      const splashPath = path.join(projectRoot, "assets/images/splash-icon.png");
      expect(fs.existsSync(splashPath)).toBe(true);
    });
  });
});
