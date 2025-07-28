import { ThemePageClient } from '@/components/theme-page-client';
import { getThemeById } from '@/lib/levels';

export default async function ThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const theme = getThemeById(id);

  return <ThemePageClient theme={theme} />;
}
