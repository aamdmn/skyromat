import { notFound } from 'next/navigation';
import { LevelPageClient } from '@/components/level-page-client';
import { getLevelById } from '@/lib/levels';

export default async function LevelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const level = getLevelById(id);

  if (!level) {
    return notFound();
  }

  return <LevelPageClient level={level} />;
}
