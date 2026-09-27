import type { Page } from '../../types/api';
import { Button, Heading } from '../common/UI';
import { ArrowRightIcon, BoardIcon, PlusIcon } from '../common/Icons';

export function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
      <section className="mx-auto max-w-2xl text-center">
        <Heading level={1} className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Retro<span className="text-blue-600">Voice</span>
        </Heading>
        <p className="mt-2 text-base font-medium text-slate-700 sm:text-lg">
          Better conversations. Better sprints.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          Bring your team&apos;s transcripts together, surface what matters, and run a focused retrospective.
        </p>
      </section>

      <section className="mx-auto mt-12 flex max-w-3xl flex-col gap-5" aria-label="Get started">
        <Button
          onClick={() => onNavigate('create')}
          className="group w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md sm:p-7"
        >
          <span className="flex items-start gap-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <PlusIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-4">
                <Heading level={2} className="text-xl font-semibold text-slate-950">
                  Create Sprint
                </Heading>
                <span className="text-blue-600 transition-transform group-hover:translate-x-1">
                  <ArrowRightIcon />
                </span>
              </span>
              <span className="mt-2 block max-w-xl text-sm leading-6 text-slate-600">
                Start a new sprint and add transcripts you want RetroVoice to analyze
              </span>
            </span>
          </span>
        </Button>

        <Button
          onClick={() => onNavigate('board')}
          className="group w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md sm:p-7"
        >
          <span className="flex items-start gap-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200">
              <BoardIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-4">
                <Heading level={2} className="text-xl font-semibold text-slate-950">
                  Sprint Retrospective Board
                </Heading>
                <span className="text-indigo-600 transition-transform group-hover:translate-x-1">
                  <ArrowRightIcon />
                </span>
              </span>
              <span className="mt-2 block max-w-xl text-sm leading-6 text-slate-600">
                Review sprint insights with your team and capture the next steps together.
              </span>
            </span>
          </span>
        </Button>
      </section>
    </main>
  );
}
