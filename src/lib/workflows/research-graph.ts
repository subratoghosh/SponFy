import { StateGraph, Annotation } from "@langchain/langgraph";
import { getGeminiClient, getTavilyClient } from "../integrations/factory";
import { Campaign, Company, ScoreFactor, SourceItem, ResearchSections } from "@/types";

// Define the State Annotation
export const ResearchState = Annotation.Root({
  companyName: Annotation<string>,
  website: Annotation<string>,
  industry: Annotation<string>,
  description: Annotation<string>,
  campaign: Annotation<Campaign>,
  sources: Annotation<SourceItem[]>,
  sections: Annotation<ResearchSections>,
  recommendedAngle: Annotation<string>,
  fitScore: Annotation<number>,
  confidence: Annotation<number>,
  scoreBreakdown: Annotation<ScoreFactor[]>,
  summaryReason: Annotation<string>,
  currentStep: Annotation<string>,
  progress: Annotation<number>,
});

export async function runResearchWorkflow(
  companyName: string,
  website: string,
  industry: string,
  description: string,
  campaign: Campaign,
  onProgress?: (step: string, progress: number) => void
) {
  const tavily = getTavilyClient();
  const gemini = getGeminiClient();

  // Node 1: Web Search
  onProgress?.("Searching developer and student programs", 25);
  const searchResult = await tavily.searchSponsorshipInfo(companyName, website);

  // Node 2: Extract & Classify
  onProgress?.("Extracting structured sponsorship angles", 50);
  const sections = searchResult.sections;
  const sources = searchResult.sources;
  const recommendedAngle = searchResult.recommendedAngle;

  // Node 3: Calculate Fit Score
  onProgress?.("Calculating 7-factor explainable fit score", 75);
  const scoreResult = await gemini.scoreCompanyFit(companyName, industry, description, campaign);

  // Node 4: Complete
  onProgress?.("Research complete and cited", 100);

  return {
    companyName,
    website,
    industry,
    description,
    sources,
    sections,
    recommendedAngle,
    fitScore: scoreResult.fitScore,
    confidence: scoreResult.confidence,
    scoreBreakdown: scoreResult.scoreBreakdown,
    summaryReason: scoreResult.summaryReason,
  };
}
