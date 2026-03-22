import { randomUUID } from "crypto";
import { parse } from "csv-parse/sync";
import {
  CSV_IMPORT_JOB_ID_PREFIX,
  DEFAULT_CSV_IMPORT_SCORE,
  MAX_CSV_IMPORT_ROWS,
} from "@/lib/constants/applications-import";

/** Normalize CSV header labels for alias lookup. */
export function normalizeCsvHeader(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Map normalized header → canonical field name used by `rowToImportPayload`.
 * Includes template snake_case headers and legacy spreadsheet titles.
 */
export const CSV_HEADER_ALIASES: Record<string, keyof CsvCanonicalFields | "ignore"> = {
  external_id: "external_id",
  id: "external_id",
  application_date: "application_date",
  "application date": "application_date",
  company: "company",
  role: "role",
  title: "role",
  applied_via: "applied_via",
  "applied via": "applied_via",
  location: "location",
  salary: "salary",
  recruiter_contact: "recruiter_contact",
  "recruiter contact": "recruiter_contact",
  notes: "notes",
  job_url: "job_url",
  "job url": "job_url",
  drive_doc_link: "drive_doc_link",
  "drive doc link": "drive_doc_link",
  status: "ignore",
  "interview date": "ignore",
  interview_date: "ignore",
  "last updated": "ignore",
  last_updated: "ignore",
};

export type CsvCanonicalFields = {
  external_id: string;
  application_date: string;
  company: string;
  role: string;
  applied_via: string;
  location: string;
  salary: string;
  recruiter_contact: string;
  notes: string;
  job_url: string;
  drive_doc_link: string;
};

export type CsvImportPayload = {
  jobId: string;
  title: string;
  company: string;
  appliedAt: Date;
  score: number;
  appliedVia: string;
  location: string | null;
  recruiterContact: string | null;
  description: string | null;
  url: string | null;
  fullJobSpecification: string | null;
};

function emptyCanonical(): Record<keyof CsvCanonicalFields, string> {
  return {
    external_id: "",
    application_date: "",
    company: "",
    role: "",
    applied_via: "",
    location: "",
    salary: "",
    recruiter_contact: "",
    notes: "",
    job_url: "",
    drive_doc_link: "",
  };
}

/** Map a raw CSV record (original headers) to canonical string fields. */
export function mapRecordToCanonical(record: Record<string, string>): Record<keyof CsvCanonicalFields, string> {
  const out = emptyCanonical();
  for (const [rawKey, rawVal] of Object.entries(record)) {
    const norm = normalizeCsvHeader(rawKey);
    const target = CSV_HEADER_ALIASES[norm];
    if (!target || target === "ignore") continue;
    const v = rawVal?.trim() ?? "";
    if (v && !out[target]) out[target] = v;
  }
  return out;
}

/** Parse YYYY-MM-DD or other Date-parsable strings; returns null if invalid. */
export function parseApplicationDate(value: string): Date | null {
  const t = value.trim();
  if (!t) return null;
  const isoDay = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDay) {
    const y = Number(isoDay[1]);
    const mo = Number(isoDay[2]) - 1;
    const d = Number(isoDay[3]);
    const dt = new Date(Date.UTC(y, mo, d, 12, 0, 0));
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(t);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function buildFullJobSpecification(salary: string, driveDoc: string): string | null {
  const parts: string[] = [];
  if (salary.trim()) parts.push(`Salary: ${salary.trim()}`);
  if (driveDoc.trim()) parts.push(`Drive doc: ${driveDoc.trim()}`);
  if (parts.length === 0) return null;
  return parts.join("\n");
}

function normalizeHttpUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (!/^https?:\/\//i.test(t)) return null;
  return t;
}

/**
 * Turn canonical row fields into DB-ready payload, or an error message.
 * `rowNumber` is 1-based (includes header as row 0, so first data row is 2).
 */
export function rowToImportPayload(
  row: Record<keyof CsvCanonicalFields, string>,
  rowNumber: number
): { ok: true; payload: CsvImportPayload } | { ok: false; row: number; message: string } {
  const company = row.company.trim();
  const title = row.role.trim();
  const dateRaw = row.application_date.trim();

  if (!company) {
    return { ok: false, row: rowNumber, message: "Company is required" };
  }
  if (!title) {
    return { ok: false, row: rowNumber, message: "Role / title is required" };
  }
  const appliedAt = parseApplicationDate(dateRaw);
  if (!appliedAt) {
    return { ok: false, row: rowNumber, message: "Application date is required (use YYYY-MM-DD)" };
  }

  const ext = row.external_id.trim();
  const jobId = ext ? `${CSV_IMPORT_JOB_ID_PREFIX}${ext}` : `${CSV_IMPORT_JOB_ID_PREFIX}${randomUUID()}`;

  const jobUrl = normalizeHttpUrl(row.job_url);
  const fullSpec = buildFullJobSpecification(row.salary, row.drive_doc_link);
  const notes = row.notes.trim() || null;
  const appliedVia = row.applied_via.trim() || "External";

  return {
    ok: true,
    payload: {
      jobId,
      title,
      company,
      appliedAt,
      score: DEFAULT_CSV_IMPORT_SCORE,
      appliedVia,
      location: row.location.trim() || null,
      recruiterContact: row.recruiter_contact.trim() || null,
      description: notes,
      url: jobUrl,
      fullJobSpecification: fullSpec,
    },
  };
}

export type ParsedCsvForImport = {
  rows: Record<keyof CsvCanonicalFields, string>[];
};

/** Parse CSV text into canonical rows. Throws if csv-parse fails. */
export function parseApplicationsCsvText(csvText: string): ParsedCsvForImport {
  const rawRecords = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  }) as Record<string, string>[];

  const rows = rawRecords.map((rec) => mapRecordToCanonical(rec));
  return { rows };
}

export type CsvImportError = { row: number; message: string };

export type CsvImportPreview = {
  payloads: CsvImportPayload[];
  errors: CsvImportError[];
  truncated: boolean;
};

/**
 * Validate and build payloads from parsed rows. `firstRowNumber` is the 1-based index of the first data row (usually 2).
 */
export function buildImportPreview(
  rows: Record<keyof CsvCanonicalFields, string>[],
  firstRowNumber = 2
): CsvImportPreview {
  const limited = rows.slice(0, MAX_CSV_IMPORT_ROWS);
  const truncated = rows.length > MAX_CSV_IMPORT_ROWS;

  const payloads: CsvImportPayload[] = [];
  const errors: CsvImportError[] = [];

  limited.forEach((row, i) => {
    const rowNumber = firstRowNumber + i;
    const allEmpty = Object.values(row).every((v) => !String(v).trim());
    if (allEmpty) return;

    const result = rowToImportPayload(row, rowNumber);
    if (!result.ok) {
      errors.push({ row: result.row, message: result.message });
      return;
    }
    payloads.push(result.payload);
  });

  return { payloads, errors, truncated };
}
