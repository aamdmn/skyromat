import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { AdminContentEditor } from '@/components/admin-content-editor';
import Loader from '@/components/loader';
import {
  getExercisesForAdmin,
  getLevelsForAdmin,
  getThemesForAdmin,
} from '@/lib/admin-actions';
import { auth } from '@/lib/auth';

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect('/login');
  }

  // Fetch all data in parallel
  const [themesResult, levelsResult, exercisesResult] = await Promise.all([
    getThemesForAdmin(),
    getLevelsForAdmin(),
    getExercisesForAdmin(),
  ]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 font-bold text-3xl">Content Management</h1>
      <Suspense fallback={<Loader />}>
        <AdminContentEditor
          errors={{
            themes: themesResult.error,
            levels: levelsResult.error,
            exercises: exercisesResult.error,
          }}
          initialExercises={exercisesResult.success ? exercisesResult.data : []}
          initialLevels={levelsResult.success ? levelsResult.data : []}
          initialThemes={themesResult.success ? themesResult.data : []}
        />
      </Suspense>
    </div>
  );
}
