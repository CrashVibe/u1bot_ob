import "./style.css";

import type { HistoryAppProps, TodayHistoryEvent } from "../src/model";

export type AppProps = HistoryAppProps;

const typeLabels: Record<TodayHistoryEvent["type"], string> = {
  birth: "出生",
  death: "逝世",
  event: "事件"
};

const typeColors: Record<TodayHistoryEvent["type"], string> = {
  birth: "text-birth dark:text-birth-dark border-birth dark:border-birth-dark",
  death: "text-death dark:text-death-dark border-death dark:border-death-dark",
  event: "text-event dark:text-event-dark border-event dark:border-event-dark"
};

export default function App({ events = [], theme = "light", currentDate = "" }: AppProps) {
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="paper-grain bg-paper px-12 py-10 font-display text-ink dark:bg-paper-dark dark:text-ink-dark">
        <header className="mb-10 text-center">
          <div className="mb-2 flex items-center justify-center gap-4">
            <span className="h-px max-w-32 flex-1 bg-ink/40 dark:bg-ink-dark/40" />
            <h1 className="text-5xl font-bold tracking-widest">今 日 历 史</h1>
            <span className="h-px max-w-32 flex-1 bg-ink/40 dark:bg-ink-dark/40" />
          </div>
          <p className="text-lg italic text-ink-muted dark:text-ink-dark-muted">{currentDate} · 历史上的今天</p>
        </header>

        {events.length > 0 ? (
          <div className="grid grid-cols-3 gap-8">
            {events.map((event, i) => (
              <article
                key={i}
                className="relative rounded-sm border border-ink/15 bg-paper-soft p-6 shadow-[0_6px_16px_rgba(0,0,0,0.15)] dark:border-ink-dark/15 dark:bg-paper-dark-soft"
                style={{ transform: `rotate(${i % 2 === 0 ? -0.6 : 0.6}deg)` }}
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="flex h-14 w-14 -rotate-6 items-center justify-center rounded-full border-2 border-double border-seal text-sm font-bold text-seal dark:border-seal-dark dark:text-seal-dark">
                    {event.year}
                  </span>
                  <span
                    className={`rotate-3 mix-blend-multiply rounded-sm border px-2 py-1 text-xs font-semibold uppercase tracking-wider dark:mix-blend-normal ${typeColors[event.type]}`}
                  >
                    {typeLabels[event.type]}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold leading-snug">{event.title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted dark:text-ink-dark-muted">{event.desc}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-ink-muted dark:text-ink-dark-muted">
            <div className="mb-4 text-6xl">📜</div>
            <p className="text-xl italic">暂无历史事件，今天的历史正在整理中…</p>
          </div>
        )}

        <footer className="mt-10 border-t border-dashed border-ink/30 pt-6 text-center text-sm italic text-ink-muted dark:border-ink-dark/30 dark:text-ink-dark-muted">
          历史的每一天都值得铭记
        </footer>
      </div>
    </div>
  );
}
