'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createExercise,
  createLevel,
  createTheme,
  deleteExercise,
  deleteLevel,
  deleteTheme,
} from '@/lib/admin-actions';

interface Theme {
  id: number;
  name: string;
  description: string | null;
  userId: string;
}

interface Level {
  id: number;
  name: string;
  description: string | null;
  difficulty: number;
  themeId: number;
  themeName?: string;
}

interface Exercise {
  id: number;
  type: string;
  question: string | null;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  levelId: number;
  levelName?: string;
  themeName?: string;
}

interface AdminContentEditorProps {
  initialThemes: Theme[];
  initialLevels: Level[];
  initialExercises: Exercise[];
  errors: {
    themes: string | null;
    levels: string | null;
    exercises: string | null;
  };
}

export function AdminContentEditor({
  initialThemes,
  initialLevels,
  initialExercises,
  errors,
}: AdminContentEditorProps) {
  const [selectedTab, setSelectedTab] = useState<
    'themes' | 'levels' | 'exercises'
  >('themes');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Show error messages if data fetching failed
  useEffect(() => {
    if (errors.themes) {
      toast.error(`Themes: ${errors.themes}`);
    }
    if (errors.levels) {
      toast.error(`Levels: ${errors.levels}`);
    }
    if (errors.exercises) {
      toast.error(`Exercises: ${errors.exercises}`);
    }
  }, [errors]);

  const tabs = [
    {
      id: 'themes',
      label: 'Themes',
      component: <ThemesTab themes={initialThemes} />,
    },
    {
      id: 'levels',
      label: 'Levels',
      component: <LevelsTab levels={initialLevels} themes={initialThemes} />,
    },
    {
      id: 'exercises',
      label: 'Exercises',
      component: (
        <ExercisesTab exercises={initialExercises} levels={initialLevels} />
      ),
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        {tabs.map((tab) => (
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === tab.id
                ? 'border-primary border-b-2 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.find((tab) => tab.id === selectedTab)?.component}
      </div>

      {/* Create Button */}
      <div className="fixed right-8 bottom-8">
        <Dialog onOpenChange={setIsCreateDialogOpen} open={isCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg" size="lg">
              + Create {selectedTab.slice(0, -1)}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New {selectedTab.slice(0, -1)}</DialogTitle>
            </DialogHeader>
            {selectedTab === 'themes' && (
              <CreateThemeForm onClose={() => setIsCreateDialogOpen(false)} />
            )}
            {selectedTab === 'levels' && (
              <CreateLevelForm
                onClose={() => setIsCreateDialogOpen(false)}
                themes={initialThemes}
              />
            )}
            {selectedTab === 'exercises' && (
              <CreateExerciseForm
                levels={initialLevels}
                onClose={() => setIsCreateDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ThemesTab({ themes }: { themes: Theme[] }) {
  const handleDelete = async (id: number, name: string) => {
    if (
      !confirm(
        `Naozaj chcete zmazať tému "${name}"? Týmto sa zmažú všetky úrovne a cvičenia v tejto téme.`
      )
    ) {
      return;
    }

    const result = await deleteTheme(id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {themes.map((theme) => (
        <Card key={theme.id}>
          <CardHeader>
            <CardTitle>{theme.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {theme.description || 'No description'}
            </p>
            <div className="mt-4 flex space-x-2">
              <EditThemeButton />
              <Button
                onClick={() => handleDelete(theme.id, theme.name)}
                size="sm"
                variant="destructive"
              >
                Zmazať
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {themes.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">
              Žiadne témy. Vytvorte svoju prvú tému!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LevelsTab({
  levels,
  themes: _themes,
}: {
  levels: Level[];
  themes: Theme[];
}) {
  const handleDelete = async (id: number, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete level "${name}"? This will also delete all exercises in this level.`
      )
    ) {
      return;
    }

    const result = await deleteLevel(id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {levels.map((level) => (
        <Card key={level.id}>
          <CardHeader>
            <CardTitle>{level.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {level.description || 'No description'}
            </p>
            <p className="text-sm">Difficulty: {level.difficulty}</p>
            <p className="text-muted-foreground text-xs">
              Theme: {level.themeName || 'Unknown'}
            </p>
            <div className="mt-4 flex space-x-2">
              <EditLevelButton />
              <Button
                onClick={() => handleDelete(level.id, level.name)}
                size="sm"
                variant="destructive"
              >
                Zmazať
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {levels.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">
              Žiadne úrovne. Vytvorte svoju prvú úroveň!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ExercisesTab({
  exercises,
  levels: _levels,
}: {
  exercises: Exercise[];
  levels: Level[];
}) {
  const handleDelete = async (id: number, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type} exercise?`)) {
      return;
    }

    const result = await deleteExercise(id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <Card key={exercise.id}>
          <CardHeader>
            <CardTitle>{exercise.type}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {exercise.question || 'No question'}
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              Level: {exercise.levelName || 'Unknown'}
            </p>
            <p className="text-muted-foreground text-xs">
              Theme: {exercise.themeName || 'Unknown'}
            </p>
            <div className="mt-4 flex space-x-2">
              <EditExerciseButton />
              <Button
                onClick={() => handleDelete(exercise.id, exercise.type)}
                size="sm"
                variant="destructive"
              >
                Zmazať
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {exercises.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">
              Žiadne cvičenia. Vytvorte svoje prvé cvičenie!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CreateThemeForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createTheme, {
    success: false,
    message: '',
    errors: {},
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onClose();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="theme-name">Názov</Label>
        <Input id="theme-name" name="name" required />
        {state.errors?.name && (
          <p className="mt-1 text-red-500 text-sm">{state.errors.name[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="theme-description">Popis</Label>
        <Input id="theme-description" name="description" />
        {state.errors?.description && (
          <p className="mt-1 text-red-500 text-sm">
            {state.errors.description[0]}
          </p>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button onClick={onClose} type="button" variant="outline">
          Zrušiť
        </Button>
        <Button disabled={pending} type="submit">
          {pending ? 'Vytváranie...' : 'Vytvoriť'}
        </Button>
      </div>
    </form>
  );
}

function CreateLevelForm({
  onClose,
  themes,
}: {
  onClose: () => void;
  themes: Theme[];
}) {
  const [state, formAction, pending] = useActionState(createLevel, {
    success: false,
    message: '',
    errors: {},
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onClose();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="level-name">Názov</Label>
        <Input id="level-name" name="name" required />
        {state.errors?.name && (
          <p className="mt-1 text-red-500 text-sm">{state.errors.name[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="level-description">Popis</Label>
        <Input id="level-description" name="description" />
        {state.errors?.description && (
          <p className="mt-1 text-red-500 text-sm">
            {state.errors.description[0]}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="level-difficulty">Složitosť</Label>
        <Input
          defaultValue="1"
          id="level-difficulty"
          min="1"
          name="difficulty"
          required
          type="number"
        />
        {state.errors?.difficulty && (
          <p className="mt-1 text-red-500 text-sm">
            {state.errors.difficulty[0]}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="level-theme">Theme</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          id="level-theme"
          name="themeId"
          required
        >
          <option value="">Vyberte tému</option>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
        {state.errors?.themeId && (
          <p className="mt-1 text-red-500 text-sm">{state.errors.themeId[0]}</p>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button onClick={onClose} type="button" variant="outline">
          Zrušiť
        </Button>
        <Button disabled={pending} type="submit">
          {pending ? 'Vytváranie...' : 'Vytvoriť'}
        </Button>
      </div>
    </form>
  );
}

function CreateExerciseForm({
  onClose,
  levels,
}: {
  onClose: () => void;
  levels: Level[];
}) {
  const [state, formAction, pending] = useActionState(createExercise, {
    success: false,
    message: '',
    errors: {},
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      onClose();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="exercise-type">Typ</Label>
        <Input
          id="exercise-type"
          name="type"
          placeholder="e.g., Výber, Funkcia"
          required
        />
        {state.errors?.type && (
          <p className="mt-1 text-red-500 text-sm">{state.errors.type[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="exercise-question">Otázka</Label>
        <Input
          id="exercise-question"
          name="question"
          placeholder="Napíšte otázku"
        />
        {state.errors?.question && (
          <p className="mt-1 text-red-500 text-sm">
            {state.errors.question[0]}
          </p>
        )}
      </div>
      {/* <div>
        <Label htmlFor="exercise-options">
          Options (comma-separated, optional)
        </Label>
        <Input
          id="exercise-options"
          name="options"
          placeholder="Option 1, Option 2, Option 3"
        />
        {state.errors?.options && (
          <p className="mt-1 text-red-500 text-sm">{state.errors.options[0]}</p>
        )}
      </div> */}
      <div>
        <Label htmlFor="exercise-answer">Správna odpoveď</Label>
        <Input id="exercise-answer" name="correctAnswer" required />
        {state.errors?.correctAnswer && (
          <p className="mt-1 text-red-500 text-sm">
            {state.errors.correctAnswer[0]}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="exercise-explanation">Napoveda</Label>
        <Input
          id="exercise-explanation"
          name="explanation"
          placeholder="Napíšte napovedu"
        />
        {state.errors?.explanation && (
          <p className="mt-1 text-red-500 text-sm">
            {state.errors.explanation[0]}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="exercise-level">Úroveň</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          id="exercise-level"
          name="levelId"
          required
        >
          <option value="">Vyberte úroveň</option>
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name} (Téma: {level.themeName || 'Neznáma'})
            </option>
          ))}
        </select>
        {state.errors?.levelId && (
          <p className="mt-1 text-red-500 text-sm">{state.errors.levelId[0]}</p>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button onClick={onClose} type="button" variant="outline">
          Zrušiť
        </Button>
        <Button disabled={pending} type="submit">
          {pending ? 'Vytváranie...' : 'Vytvoriť'}
        </Button>
      </div>
    </form>
  );
}

// Edit button components (placeholders for now)
function EditThemeButton() {
  return (
    <Button size="sm" variant="outline">
      Upraviť
    </Button>
  );
}

function EditLevelButton() {
  return (
    <Button size="sm" variant="outline">
      Upraviť
    </Button>
  );
}

function EditExerciseButton() {
  return (
    <Button size="sm" variant="outline">
      Upraviť
    </Button>
  );
}
