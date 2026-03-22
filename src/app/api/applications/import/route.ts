import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth/session";
import { unauthorizedResponse } from "@/lib/auth/api-key";
import { MANUAL_SOURCE } from "@/lib/constants/manual-source";
import {
  buildImportPreview,
  parseApplicationsCsvText,
} from "@/lib/applications/csv-import";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

function isUniqueConstraint(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorizedResponse();

  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data with a file field named file" },
      { status: 400 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (file == null || typeof file === "string") {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  const blob = file as Blob;
  if (typeof blob.text !== "function") {
    return NextResponse.json({ error: "Invalid file field" }, { status: 400 });
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
  }

  const name =
    typeof File !== "undefined" && file instanceof File && typeof file.name === "string"
      ? file.name
      : "";
  if (name && !name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "Upload must be a .csv file" }, { status: 400 });
  }

  const csvText = await blob.text();

  let parsed: ReturnType<typeof parseApplicationsCsvText>;
  try {
    parsed = parseApplicationsCsvText(csvText);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid CSV";
    return NextResponse.json({ error: `CSV parse failed: ${msg}` }, { status: 400 });
  }

  const { payloads, errors, truncated } = buildImportPreview(parsed.rows);

  if (parsed.rows.length === 0) {
    return NextResponse.json({ error: "CSV has no data rows (need a header + at least one row)" }, { status: 400 });
  }

  if (payloads.length === 0 && errors.length === 0) {
    return NextResponse.json(
      { error: "No importable rows (all rows were empty)" },
      { status: 400 }
    );
  }

  let created = 0;
  let skipped = 0;
  const rowErrors = [...errors];

  for (const p of payloads) {
    try {
      await prisma.$transaction(async (tx) => {
        const opportunity = await tx.opportunity.create({
          data: {
            jobId: p.jobId,
            source: MANUAL_SOURCE,
            title: p.title,
            company: p.company,
            location: p.location,
            workingModel: null,
            listingType: null,
            salaryMin: null,
            salaryMax: null,
            score: p.score,
            verdict: null,
            matchReasons: null,
            redFlags: null,
            url: p.url,
            description: p.description,
            status: "applied",
            appliedAt: p.appliedAt,
            stage: "Applied",
            postedAt: null,
            appliedVia: p.appliedVia,
            recruiterContact: p.recruiterContact,
            fullJobSpecification: p.fullJobSpecification,
          },
        });
        await tx.applicationStageLog.create({
          data: { opportunityId: opportunity.id, stage: "Applied" },
        });
      });
      created += 1;
    } catch (e) {
      if (isUniqueConstraint(e)) {
        skipped += 1;
      } else {
        throw e;
      }
    }
  }

  return NextResponse.json({
    created,
    skipped,
    truncated,
    errors: rowErrors,
  });
}
