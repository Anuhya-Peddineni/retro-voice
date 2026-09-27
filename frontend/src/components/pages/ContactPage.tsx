import { Heading } from '../common/UI';

export function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
      <span className="text-sm font-semibold text-blue-700">Support</span>
      <Heading level={1} className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        Contact us
      </Heading>
      <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
        Have a question about RetroVoice? Our team is ready to help.
      </p>
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Heading level={2} className="text-lg font-semibold text-slate-950">
          Talk to our support team
        </Heading>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Reach out to either of us and we&apos;ll be happy to help.
        </p>
        <ul className="mt-5 space-y-3">
          <li>
            <a
              href="mailto:ananyapeddineninaidu@gmail.com"
              className="text-sm font-medium text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
            >
              ananyapeddineninaidu@gmail.com
            </a>
          </li>
          <li>
            <a
              href="mailto:anuhyapeddineni@gmail.com"
              className="text-sm font-medium text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
            >
              anuhyapeddineni@gmail.com
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
