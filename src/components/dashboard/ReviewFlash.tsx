import Link from "next/link";

interface ReviewFlashProps {
  count: number;
}

export function ReviewFlash({ count }: ReviewFlashProps) {
  if (count <= 1) return null;

  return (
    <div
      className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground"
      data-testid="review-flash"
    >
      There are {count} opportunities ready to be reviewed.{" "}
      <Link
        href="/opportunities?status=new"
        className="font-medium underline underline-offset-2 hover:no-underline"
      >
        Review now
      </Link>
    </div>
  );
}
