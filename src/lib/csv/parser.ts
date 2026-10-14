/**
 * RFC 4180-compliant CSV Parser and Smart Company Column Mapper
 * Zero external dependencies.
 */

export interface ParsedCompanyInput {
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  pipelineValue?: number;
  fitScore?: number;
  stage?: string;
  contactName?: string;
  contactEmail?: string;
  contactRole?: string;
  contactLinkedin?: string;
}

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  companyInputs: ParsedCompanyInput[];
  errors: string[];
}

/**
 * Parses raw CSV text into rows of key-value pairs, properly handling
 * quoted values, commas inside quotes, multi-line fields, and escaped quotes ("").
 */
export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  // Normalize CRLF to LF
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentField += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim());
      // Only push non-empty rows
      if (currentRow.some((f) => f.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Handle final field and row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = lines[0];
  const headers = rawHeaders.map((h) => h.replace(/^[\uFEFF]/, '').trim()); // Strip BOM if present

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const rowObj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = line[j] !== undefined ? line[j] : '';
    }
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * Normalizes header string for fuzzy matching (lowercases, removes underscores/hyphens/spaces)
 */
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Intelligent mapper from dynamic CSV headers to SponFy Company & Contact fields.
 */
export function mapCSVToCompanyInputs(rows: Record<string, string>[]): ParsedCompanyInput[] {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const headerMap: Record<string, string> = {};

  for (const h of headers) {
    const norm = normalizeHeader(h);
    // Company Name
    if (['company', 'companyname', 'name', 'organization', 'sponsor', 'brand', 'firm'].includes(norm)) {
      headerMap.name = h;
    }
    // Website / URL
    else if (['website', 'url', 'domain', 'site', 'link', 'web'].includes(norm)) {
      headerMap.website = h;
    }
    // Industry / Vertical
    else if (['industry', 'sector', 'category', 'vertical', 'domainfield'].includes(norm)) {
      headerMap.industry = h;
    }
    // Description / Notes
    else if (['description', 'about', 'overview', 'summary', 'notes', 'details', 'pitchangle'].includes(norm)) {
      headerMap.description = h;
    }
    // Pipeline Value
    else if (
      [
        'pipelinevalue',
        'value',
        'targetamount',
        'amount',
        'budget',
        'inr',
        'estimatedvalue',
        'sponsorshipamount',
        'dealvalue',
      ].includes(norm)
    ) {
      headerMap.pipelineValue = h;
    }
    // Fit Score
    else if (['fitscore', 'score', 'fit', 'relevance', 'matchscore'].includes(norm)) {
      headerMap.fitScore = h;
    }
    // Pipeline Stage
    else if (['stage', 'status', 'pipelinestage', 'leadstatus'].includes(norm)) {
      headerMap.stage = h;
    }
    // Contact Person Name
    else if (
      [
        'contactname',
        'contact',
        'poc',
        'person',
        'lead',
        'leadname',
        'pocname',
        'pointofcontact',
        'fullname',
        'contactperson',
        'representative',
      ].includes(norm)
    ) {
      headerMap.contactName = h;
    }
    // Contact Email
    else if (
      [
        'contactemail',
        'email',
        'pocemail',
        'workemail',
        'leademail',
        'mail',
        'emailaddress',
      ].includes(norm)
    ) {
      headerMap.contactEmail = h;
    }
    // Contact Role / Title
    else if (
      [
        'contactrole',
        'role',
        'title',
        'designation',
        'position',
        'jobtitle',
        'leadrole',
      ].includes(norm)
    ) {
      headerMap.contactRole = h;
    }
    // LinkedIn
    else if (['linkedin', 'linkedinurl', 'profile', 'social'].includes(norm)) {
      headerMap.contactLinkedin = h;
    }
  }

  // Fallback: If no explicit 'name' column matched, find first column with 'name' or use first column
  if (!headerMap.name) {
    const fallbackCol = headers.find((h) => normalizeHeader(h).includes('name')) || headers[0];
    if (fallbackCol) headerMap.name = fallbackCol;
  }

  const results: ParsedCompanyInput[] = [];

  for (const row of rows) {
    const rawName = headerMap.name ? row[headerMap.name] : '';
    if (!rawName || rawName.trim().length === 0) continue;

    // Parse numeric pipeline value
    let pipelineValue: number | undefined = undefined;
    if (headerMap.pipelineValue && row[headerMap.pipelineValue]) {
      const cleanNum = row[headerMap.pipelineValue].replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleanNum);
      if (!isNaN(parsed)) pipelineValue = Math.round(parsed);
    }

    // Parse fit score
    let fitScore: number | undefined = undefined;
    if (headerMap.fitScore && row[headerMap.fitScore]) {
      const cleanNum = row[headerMap.fitScore].replace(/[^0-9.]/g, '');
      const parsed = parseInt(cleanNum, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) fitScore = parsed;
    }

    results.push({
      name: rawName.trim(),
      website: headerMap.website ? row[headerMap.website]?.trim() : undefined,
      industry: headerMap.industry ? row[headerMap.industry]?.trim() : undefined,
      description: headerMap.description ? row[headerMap.description]?.trim() : undefined,
      pipelineValue,
      fitScore: fitScore !== undefined ? fitScore : 85,
      stage: headerMap.stage ? row[headerMap.stage]?.trim() : 'Discovered',
      contactName: headerMap.contactName ? row[headerMap.contactName]?.trim() : undefined,
      contactEmail: headerMap.contactEmail ? row[headerMap.contactEmail]?.trim() : undefined,
      contactRole: headerMap.contactRole ? row[headerMap.contactRole]?.trim() : undefined,
      contactLinkedin: headerMap.contactLinkedin ? row[headerMap.contactLinkedin]?.trim() : undefined,
    });
  }

  return results;
}

/**
 * Generates sample CSV text that users can download as an import template.
 */
export function generateSampleCSV(): string {
  return [
    'Company Name,Website,Industry,Description,Estimated Value (INR),Stage,Contact Name,Contact Email,Contact Role',
    'Postman,https://www.postman.com,Developer Tools,"API platform supporting developer events and technical challenge tracks",75000,Discovered,Sneha Rao,sneha.rao@postman.com,Developer Relations Lead',
    'Razorpay,https://razorpay.com,Fintech & Payments,"Payment gateway provider with active college startup grants",100000,Contacted,Kunal Patel,kunal.p@razorpay.com,Campus Partnerships Manager',
    'GitHub,https://github.com,Developer Tools,"GitHub Campus Experts and student developer pack partner",150000,Discovered,Sarah Jenkins,sjenkins@github.com,Global Education Lead',
    'Hasura,https://hasura.io,Cloud & Infrastructure,"Instant GraphQL database backend track prizes",50000,Discovered,Rohan Roy,rohan@hasura.io,Community Engineer',
  ].join('\n');
}
