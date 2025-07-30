import { ThemePageClient } from '@/components/theme-page-client';
import { getThemeById } from '@/lib/levels';

export default async function ThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const theme = await getThemeById(Number.parseInt(id, 10));

  return <ThemePageClient theme={theme} />;
}
