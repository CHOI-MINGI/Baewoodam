import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen px-4 py-6 flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-3 mt-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}
