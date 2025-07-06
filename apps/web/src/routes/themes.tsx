import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/themes')({
  component: ThemesLayout,
});

function ThemesLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
