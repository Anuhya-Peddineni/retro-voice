import type { Page } from '../../types/api';
import { Button } from '../common/UI';

export function AppFooter({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-end px-5 py-6 sm:px-8">
        <nav className="flex items-center gap-2" aria-label="Footer">
          <Button
            onClick={() => onNavigate('contact')}
            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            Contact us
          </Button>
          <Button
            onClick={() => onNavigate('help')}
            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            Help
          </Button>
        </nav>
      </div>
    </footer>
  );
}
