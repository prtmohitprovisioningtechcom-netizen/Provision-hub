import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CompanyNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
      <p className="text-gray-500 mb-6">This company profile does not exist or is not available.</p>
      <Button asChild>
        <Link href="/search">Browse Companies</Link>
      </Button>
    </div>
  );
}
