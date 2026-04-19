import Link from 'next/link';
import { BookOpen, Layers, Microscope } from 'lucide-react';

const CARDS = [
  {
    href: '/case-studies',
    icon: BookOpen,
    title: 'Read the case studies',
    body: '13 chronological deep-dives — from the pilot feature to hardware-aware dispatch.',
  },
  {
    href: '/framework',
    icon: Layers,
    title: 'Tour the framework',
    body: 'The skills, hub, cache layers, and dispatch intelligence, explained floor by floor.',
  },
  {
    href: '/research',
    icon: Microscope,
    title: 'See the research',
    body: 'SoC-on-software, hardware-aware dispatch, and what comes next.',
  },
];

export function ThreeWaysIn() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-serif text-3xl text-center mb-12">Three ways in</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group p-6 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] hover:border-[var(--color-brand-indigo)] hover:shadow-lg transition-all"
              >
                <Icon size={28} className="text-[var(--color-brand-indigo)]" />
                <h3 className="mt-4 font-serif text-xl group-hover:text-[var(--color-brand-indigo)]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                  {card.body}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
