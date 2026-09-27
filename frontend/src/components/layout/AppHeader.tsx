import type { Page } from '../../types/api';
import { Button, Logo } from '../common/UI';
import { ChevronLeftIcon } from '../common/Icons';

export function AppHeader({ page, onNavigate }: { page: Page; onNavigate: (page: Page) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div
        className={`relative mx-auto flex h-16 max-w-7xl items-center px-5 sm:px-8 ${
          page === 'home' ? 'justify-start' : 'justify-center'
        }`}
      >
        {page !== 'home' && (
          <Button
            onClick={() => onNavigate('home')}
            className="absolute left-5 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:left-8"
          >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}
        <Logo onClick={() => onNavigate('home')} />
      </div>
    </header>
  );
}
