import { describe, expect, it } from "vitest";
import { COACHES } from "../../src/data/coaches";

describe("coaches data", () => {
  it("has 13 entries", () => {
    expect(COACHES).toHaveLength(13);
  });

  it("has unique ids", () => {
    const ids = COACHES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry has all required fields", () => {
    for (const c of COACHES) {
      expect(c.id).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.voiceLabel.length).toBeGreaterThan(0);
      expect(c.blurb.length).toBeGreaterThan(0);
      expect(c.previewLine.length).toBeGreaterThan(0);
      expect(c.voiceId).toMatch(/^[A-Za-z0-9]+$/);
      expect(c.settings.stability).toBeGreaterThanOrEqual(0);
      expect(c.settings.similarity_boost).toBeGreaterThanOrEqual(0);
    }
  });

  it("has four adult coaches", () => {
    const adults = COACHES.filter((c) => c.adult === true);
    expect(adults.map((c) => c.id).sort()).toEqual(
      ["mickey", "texas-champ", "velominati", "wade"]
    );
  });

  it("every coach has a valid category", () => {
    const allowed = new Set(["tough", "banter", "pro"]);
    for (const c of COACHES) {
      expect(allowed.has(c.category)).toBe(true);
    }
  });

  it("every category has at least one coach", () => {
    const present = new Set(COACHES.map((c) => c.category));
    expect(present.has("tough")).toBe(true);
    expect(present.has("banter")).toBe(true);
    expect(present.has("pro")).toBe(true);
  });
});
