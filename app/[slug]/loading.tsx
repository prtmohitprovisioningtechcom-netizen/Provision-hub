import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyLoading() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950" aria-busy="true">
      <Skeleton className="h-72 w-full rounded-none" />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
