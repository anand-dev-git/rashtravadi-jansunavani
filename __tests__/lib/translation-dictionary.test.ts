import {
  getEnglishProblem,
  getEnglishProblems,
  normalizeProblemForStorage,
} from "@/lib/translation-dictionary";

describe("Translation Dictionary", () => {
  describe("getEnglishProblem", () => {
    it("returns the same text if already in English", () => {
      expect(getEnglishProblem("Water Supply")).toBe("Water Supply");
      expect(getEnglishProblem("Property Tax")).toBe("Property Tax");
    });

    it("translates Hindi text to English", () => {
      expect(getEnglishProblem("जल आपूर्ति")).toBe("Water Supply");
      expect(getEnglishProblem("मालमत्ता कर")).toBe("Property Tax");
      expect(getEnglishProblem("पुलिस विभाग")).toBe("Police");
    });

    it("translates Marathi text to English", () => {
      expect(getEnglishProblem("जल आपूर्ति")).toBe("Water Supply");
      expect(getEnglishProblem("घनकचरा व स्वच्छता")).toBe(
        "Waste & Cleanliness"
      );
    });

    it("handles case insensitive matching", () => {
      expect(getEnglishProblem("water supply")).toBe("Water Supply");
      expect(getEnglishProblem("WATER SUPPLY")).toBe("Water Supply");
      expect(getEnglishProblem("Water supply")).toBe("Water Supply");
    });

    it("handles partial matches", () => {
      expect(getEnglishProblem("Water")).toBe("Water Supply");
      expect(getEnglishProblem("Police")).toBe("Police");
    });

    it("returns original text if no match found", () => {
      expect(getEnglishProblem("Unknown Problem")).toBe("Unknown Problem");
      expect(getEnglishProblem("")).toBe("");
    });

    it("handles null and undefined input", () => {
      expect(getEnglishProblem(null as any)).toBe(null);
      expect(getEnglishProblem(undefined as any)).toBe(undefined);
    });
  });

  describe("getEnglishProblems", () => {
    it("returns array of English problem names", () => {
      const problems = getEnglishProblems();

      expect(Array.isArray(problems)).toBe(true);
      expect(problems.length).toBeGreaterThan(0);
      expect(problems).toContain("Water Supply");
      expect(problems).toContain("Property Tax");
      expect(problems).toContain("Police");
    });

    it("returns unique problem names", () => {
      const problems = getEnglishProblems();
      const uniqueProblems = [...new Set(problems)];

      expect(problems.length).toBe(uniqueProblems.length);
    });
  });

  describe("normalizeProblemForStorage", () => {
    it("normalizes problem text for storage", () => {
      expect(normalizeProblemForStorage("Water Supply")).toBe("Water Supply");
      expect(normalizeProblemForStorage("जल आपूर्ति")).toBe("Water Supply");
      expect(normalizeProblemForStorage("water supply")).toBe("Water Supply");
    });

    it("handles empty input", () => {
      expect(normalizeProblemForStorage("")).toBe("");
      expect(normalizeProblemForStorage(null as any)).toBe(null);
      expect(normalizeProblemForStorage(undefined as any)).toBe(undefined);
    });
  });
});
