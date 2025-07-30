import { notFound } from 'next/navigation';
import { LevelPageClient } from '@/components/level-page-client';
import { getLevelById, getThemeById } from '@/lib/levels';

export default async function LevelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const level = await getLevelById(Number.parseInt(id, 10));

  if (!level) {
    return notFound();
  }

  // Get all levels for the theme to enable proper progress tracking
  const theme = await getThemeById(level.themeId);
  const themeLevels = theme?.levels ?? [];

  return <LevelPageClient level={level} themeLevels={themeLevels} />;
}
