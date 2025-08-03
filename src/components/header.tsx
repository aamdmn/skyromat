'use client';
import { ChevronDown, Edit2, Loader2, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';

export default function Header() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, error, isPending } = authClient.useSession();

  if (isPending) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!session?.user) {
    return <div>Not logged in</div>;
  }

  return (
    <header className="mb-10 bg-transparent">
      <div className="container mx-auto flex h-14 items-center justify-between bg-transparent px-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <h1 className="font-medium text-primary text-xl">SkyroMat</h1>
          </Link>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 gap-2 px-2" variant="ghost">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-light text-sm">{session.user.name}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push('/admin')}>
              <Edit2 className="mr-2 h-4 w-4" />
              Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={loading}
              onClick={() => {
                setLoading(true);
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push('/login');
                    },
                  },
                });
              }}
              variant="destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
