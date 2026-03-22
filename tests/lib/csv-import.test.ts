import { describe, it, expect } from "vitest";
import {
  buildImportPreview,
  mapRecordToCanonical,
  normalizeCsvHeader,
  parseApplicationDate,
  parseApplicationsCsvText,
  rowToImportPayload,
} from "@/lib/applications/csv-import";
import { CSV_IMPORT_JOB_ID_PREFIX } from "@/lib/constants/applications-import";

describe("normalizeCsvHeader", () => {
  it("lowercases and collapses spaces", () => {
    expect(normalizeCsvHeader("  Application   Date ")).toBe("application date");
  });
});

describe("mapRecordToCanonical", () => {
  it("maps legacy spreadsheet headers", () => {
    const row = mapRecordToCanonical({
      ID: "x-1",
      "Application Date": "2026-02-10",
      Company: "Acme",
      Role: "PM",
      Status: "Rejected",
      Salary: "80k",
      Location: "UK",
      "Applied Via": "Web",
      "Interview Date": "TBC",
      "Recruiter Contact": "rec@x.com",
      "Last Updated": "2026-02-11",
      Notes: "hello",
      "Drive Doc Link": "https://drive.example/doc",
    });
    expect(row.external_id).toBe("x-1");
    expect(row.application_date).toBe("2026-02-10");
    expect(row.company).toBe("Acme");
    expect(row.role).toBe("PM");
    expect(row.salary).toBe("80k");
    expect(row.applied_via).toBe("Web");
    expect(row.recruiter_contact).toBe("rec@x.com");
    expect(row.notes).toBe("hello");
    expect(row.drive_doc_link).toBe("https://drive.example/doc");
  });
});

describe("parseApplicationDate", () => {
  it("parses ISO date", () => {
    const d = parseApplicationDate("2026-02-10");
    expect(d?.getUTCFullYear()).toBe(2026);
    expect(d?.getUTCMonth()).toBe(1);
    expect(d?.getUTCDate()).toBe(10);
  });

  it("returns null for empty", () => {
    expect(parseApplicationDate("")).toBeNull();
    expect(parseApplicationDate("   ")).toBeNull();
  });
});

describe("rowToImportPayload", () => {
  it("builds payload with optional url and fullJobSpecification parts", () => {
    const row = mapRecordToCanonical({
      external_id: "abc",
      application_date: "2026-03-01",
      company: "Co",
      role: "Dev",
      salary: "£90k",
      drive_doc_link: "https://drive.example/x",
      job_url: "https://jobs.example/1",
    });
    const r = rowToImportPayload(row, 2);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.payload.jobId).toBe(`${CSV_IMPORT_JOB_ID_PREFIX}abc`);
    expect(r.payload.url).toBe("https://jobs.example/1");
    expect(r.payload.fullJobSpecification).toContain("Salary: £90k");
    expect(r.payload.fullJobSpecification).toContain("Drive doc:");
    expect(r.payload.appliedVia).toBe("External");
  });

  it("fails without company", () => {
    const row = mapRecordToCanonical({
      application_date: "2026-03-01",
      company: "",
      role: "Dev",
    });
    const r = rowToImportPayload(row, 3);
    expect(r.ok).toBe(false);
  });
});

describe("parseApplicationsCsvText + buildImportPreview", () => {
  it("parses template-style CSV", () => {
    const csv = [
      "external_id,application_date,company,role",
      "1,2026-01-15,A,B",
      ",2026-01-16,C,D",
    ].join("\n");
    const { rows } = parseApplicationsCsvText(csv);
    const { payloads, errors } = buildImportPreview(rows);
    expect(errors).toHaveLength(0);
    expect(payloads).toHaveLength(2);
    expect(payloads[0].company).toBe("A");
    expect(payloads[1].jobId.startsWith(CSV_IMPORT_JOB_ID_PREFIX)).toBe(true);
  });
});
