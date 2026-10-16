import { describe, it, expect } from "vitest";
import { parseCountFromPrompt, updateCountInPrompt } from "@/lib/discovery/count-parser";

describe("parseCountFromPrompt", () => {
  it("parses 'give me 10' as shown in the user screenshot", () => {
    expect(parseCountFromPrompt("give me 10")).toBe(10);
  });

  it("parses action verbs with pronouns and numbers", () => {
    expect(parseCountFromPrompt("give 10")).toBe(10);
    expect(parseCountFromPrompt("give us 20")).toBe(20);
    expect(parseCountFromPrompt("find me 15 sponsors")).toBe(15);
    expect(parseCountFromPrompt("show me 5")).toBe(5);
    expect(parseCountFromPrompt("get me 25")).toBe(25);
    expect(parseCountFromPrompt("need 10 startups")).toBe(10);
    expect(parseCountFromPrompt("top 20 developer tool companies")).toBe(20);
    expect(parseCountFromPrompt("search 15 brands")).toBe(15);
    expect(parseCountFromPrompt("discover 5")).toBe(5);
    expect(parseCountFromPrompt("suggest 10 companies")).toBe(10);
  });

  it("parses numbers followed by sponsor/company nouns", () => {
    expect(parseCountFromPrompt("10 sponsors")).toBe(10);
    expect(parseCountFromPrompt("20 AI and developer tool companies")).toBe(20);
    expect(parseCountFromPrompt("5 startups for hackathon")).toBe(5);
    expect(parseCountFromPrompt("15 brands")).toBe(15);
    expect(parseCountFromPrompt("25 leads")).toBe(25);
  });

  it("parses explicit label patterns", () => {
    expect(parseCountFromPrompt("target: 10")).toBe(10);
    expect(parseCountFromPrompt("count: 20")).toBe(20);
    expect(parseCountFromPrompt("target count 15")).toBe(15);
    expect(parseCountFromPrompt("limit 5")).toBe(5);
    expect(parseCountFromPrompt("qty: 25")).toBe(25);
  });

  it("parses prompts starting with a number or just a number", () => {
    expect(parseCountFromPrompt("10")).toBe(10);
    expect(parseCountFromPrompt("15 AI cloud platforms")).toBe(15);
  });

  it("parses written word numbers", () => {
    expect(parseCountFromPrompt("give me ten")).toBe(10);
    expect(parseCountFromPrompt("find five sponsors")).toBe(5);
    expect(parseCountFromPrompt("top twenty companies")).toBe(20);
    expect(parseCountFromPrompt("twenty-five brands")).toBe(25);
  });

  it("returns null for prompts without a count specification", () => {
    expect(parseCountFromPrompt("")).toBeNull();
    expect(parseCountFromPrompt("find cloud and dev tool sponsors")).toBeNull();
    expect(parseCountFromPrompt("hackathon sponsorship in India")).toBeNull();
  });

  it("respects upper boundary (<= 30)", () => {
    expect(parseCountFromPrompt("give me 100 sponsors")).toBeNull();
  });
});

describe("updateCountInPrompt", () => {
  it("smoothly updates 'give me 10' to 'give me 20'", () => {
    expect(updateCountInPrompt("give me 10", 20)).toBe("give me 20");
    expect(updateCountInPrompt("give me 20", 15)).toBe("give me 15");
    expect(updateCountInPrompt("give me 15", 5)).toBe("give me 5");
  });

  it("smoothly updates 'find 10 sponsors' to 'find 25 sponsors'", () => {
    expect(updateCountInPrompt("find 10 sponsors", 25)).toBe("find 25 sponsors");
  });

  it("smoothly updates 'top 5 AI companies' to 'top 10 AI companies'", () => {
    expect(updateCountInPrompt("top 5 AI companies", 10)).toBe("top 10 AI companies");
  });

  it("smoothly updates '10 sponsors' to '20 sponsors'", () => {
    expect(updateCountInPrompt("10 sponsors", 20)).toBe("20 sponsors");
  });

  it("smoothly updates 'target: 5' to 'target: 15'", () => {
    expect(updateCountInPrompt("target: 5", 15)).toBe("target: 15");
  });

  it("smoothly updates isolated numbers like '10' to '20'", () => {
    expect(updateCountInPrompt("10", 20)).toBe("20");
  });

  it("leaves prompt without number unchanged", () => {
    expect(updateCountInPrompt("developer tool companies", 15)).toBe("developer tool companies");
  });
});
