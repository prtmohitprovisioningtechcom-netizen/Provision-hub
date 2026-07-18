import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Old `/company/[slug]` URLs redirect to `/[slug]`. */
export default async function CompanySlugRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/${slug}`);
}
