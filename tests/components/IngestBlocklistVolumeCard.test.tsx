import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IngestBlocklistVolumeCard } from "@/components/dashboard/IngestBlocklistVolumeCard";

describe("IngestBlocklistVolumeCard", () => {
  it("renders total and pattern table", () => {
    render(
      <IngestBlocklistVolumeCard
        totalBlockedInWindow={10}
        windowDays={30}
        rows={[
          { pattern: "SpamCo", count: 7, topScope: "company" },
          { pattern: "temp", count: 3, topScope: "any" },
        ]}
      />
    );

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText(/blocked in last 30 days/i)).toBeInTheDocument();
    expect(screen.getByText("SpamCo")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <IngestBlocklistVolumeCard totalBlockedInWindow={0} windowDays={30} rows={[]} />
    );
    expect(screen.getByText(/No blocklist activity/i)).toBeInTheDocument();
  });
});
