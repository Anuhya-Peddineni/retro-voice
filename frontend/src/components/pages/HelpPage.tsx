import { Heading } from '../common/UI';

export function HelpPage() {
  const topics = [
    {
      title: 'Create your first sprint',
      description: 'Enter a sprint name (e.g., sprint-44), then either pull transcripts already stored for that sprint or upload new ones (up to 10 files, .txt or .vtt format, 2MB each).',
    },
    {
      title: 'Analyze a retrospective',
      description: 'Select a sprint on the board and click Analyze Sprint. RetroVoice reads your transcripts and extracts insights into "What Went Well" and "What Didn\'t Go Well." Review each insight and accept or reject it.',
    },
    {
      title: 'Add team feedback',
      description: 'Use "Add new feedback" in any column to capture observations or follow-up actions. Save the board to keep team feedback and action items in the Sprint Retrospective board.',
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
      <span className="text-sm font-semibold text-blue-700">RetroVoice guide</span>
      <Heading level={1} className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        Help center
      </Heading>
      <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
        Quick guidance to help your team get the most from every retrospective.
      </p>
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {topics.map((topic, index) => (
          <article key={topic.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
              {index + 1}
            </span>
            <Heading level={2} className="mt-4 text-base font-semibold text-slate-950">
              {topic.title}
            </Heading>
            <p className="mt-2 text-sm leading-6 text-slate-600">{topic.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
