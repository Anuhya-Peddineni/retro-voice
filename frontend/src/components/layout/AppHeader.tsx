import type { Page } from '../../types/api';
import { Button, Logo } from '../common/UI';
import { ChevronLeftIcon } from '../common/Icons';

export function AppHeader({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  const isHome = page === 'home';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="relative flex h-16 w-full items-center px-4 sm:px-5">
        {/* Back button — always absolute left so it never shifts the logo */}
        {!isHome && (
          <Button
            onClick={() => onNavigate('home')}
            className="absolute left-4 z-10 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:left-5"
          >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}

        {/* Logo: left on home, centered on all other pages */}
        <div className={isHome ? '' : 'absolute inset-x-0 flex justify-center'}>
          <Logo onClick={() => onNavigate('home')} />
        </div>
      </div>
    </header>
  );
}
