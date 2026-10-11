import { describe, it, expect } from "vitest";
import { parseCSV, mapCSVToCompanyInputs, generateSampleCSV } from "@/lib/csv/parser";

describe("CSV Parsing and Lead Ingestion Engine", () => {
  it("parses standard CSV lines properly", () => {
    const raw = "Company Name,Website,Industry\nAcme Corp,https://acme.com,Developer Tools\nBeta Labs,https://beta.dev,AI & Cloud";
    const { headers, rows } = parseCSV(raw);

    expect(headers).toEqual(["Company Name", "Website", "Industry"]);
    expect(rows.length).toBe(2);
    expect(rows[0]["Company Name"]).toBe("Acme Corp");
    expect(rows[1]["Website"]).toBe("https://beta.dev");
  });

  it("handles RFC 4180 quoted fields with embedded commas and escaped quotes", () => {
    const raw = `Company Name,Industry,Description
"Acme, Inc.",Developer Tools,"Creates \\"top-notch\\" developer tooling"
"Global Tech, LLC",Cloud,"Infrastructure, databases, and APIs"`;

    const { headers, rows } = parseCSV(raw);

    expect(rows.length).toBe(2);
    expect(rows[0]["Company Name"]).toBe("Acme, Inc.");
    expect(rows[1]["Company Name"]).toBe("Global Tech, LLC");
    expect(rows[1]["Description"]).toBe("Infrastructure, databases, and APIs");
  });

  it("strips UTF-8 BOM characters seamlessly", () => {
    const rawWithBOM = "\uFEFFCompany Name,Website\nPostman,https://postman.com";
    const { headers, rows } = parseCSV(rawWithBOM);

    expect(headers[0]).toBe("Company Name");
    expect(rows[0]["Company Name"]).toBe("Postman");
  });

  it("maps diverse CSV column headers intelligently into company lead records", () => {
    const raw = `company,site,category,budget,status,lead_name,work_email,job_title
Postman,https://postman.com,Developer Tools,"₹1,50,000",Contacted,Sneha Rao,sneha@postman.com,DevRel Lead
Razorpay,https://razorpay.com,Fintech,75000,Discovered,Kunal Patel,kunal@razorpay.com,Partnerships Manager`;

    const { rows } = parseCSV(raw);
    const companies = mapCSVToCompanyInputs(rows);

    expect(companies.length).toBe(2);
    expect(companies[0].name).toBe("Postman");
    expect(companies[0].website).toBe("https://postman.com");
    expect(companies[0].industry).toBe("Developer Tools");
    expect(companies[0].pipelineValue).toBe(150000);
    expect(companies[0].stage).toBe("Contacted");
    expect(companies[0].contactName).toBe("Sneha Rao");
    expect(companies[0].contactEmail).toBe("sneha@postman.com");
    expect(companies[0].contactRole).toBe("DevRel Lead");

    expect(companies[1].name).toBe("Razorpay");
    expect(companies[1].pipelineValue).toBe(75000);
    expect(companies[1].contactName).toBe("Kunal Patel");
  });

  it("ignores empty rows or rows missing company names", () => {
    const raw = `Company Name,Website\n\n   \nGoogle,https://google.com\n,https://empty.com`;
    const { rows } = parseCSV(raw);
    const companies = mapCSVToCompanyInputs(rows);

    expect(companies.length).toBe(1);
    expect(companies[0].name).toBe("Google");
  });

  it("generates a valid, parseable sample CSV template", () => {
    const sample = generateSampleCSV();
    expect(sample.length).toBeGreaterThan(50);

    const { headers, rows } = parseCSV(sample);
    expect(headers).toContain("Company Name");
    expect(rows.length).toBeGreaterThanOrEqual(4);

    const companies = mapCSVToCompanyInputs(rows);
    expect(companies.length).toBe(rows.length);
    expect(companies[0].name).toBe("Postman");
    expect(companies[0].contactEmail).toBe("sneha.rao@postman.com");
  });
});
