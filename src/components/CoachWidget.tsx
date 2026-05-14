import { useRef, useState } from "react";

export type CoachCategory = "tough" | "banter" | "pro";

export interface CoachCardData {
  id: string;
  name: string;
  voiceLabel: string;
  blurb: string;
  adult?: boolean;
  category: CoachCategory;
}

interface Props {
  coaches: CoachCardData[];
}

const TABS: { id: CoachCategory; label: string }[] = [
  { id: "tough", label: "Tough" },
  { id: "banter", label: "Banter" },
  { id: "pro", label: "Pro" },
];

export function CoachWidget({ coaches }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CoachCategory>("tough");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function handleClick(id: string) {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === id) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    audio.src = `/voice/coaches/${id}.mp3`;
    void audio.play().catch(() => {
      setPlayingId(null);
    });
    setPlayingId(id);
  }

  function selectTab(id: CoachCategory) {
    setActiveTab(id);
    const audio = audioRef.current;
    if (audio && playingId !== null) {
      audio.pause();
      setPlayingId(null);
    }
  }

  const visible = coaches.filter((c) => c.category === activeTab);

  return (
    <div className="coach-widget">
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlayingId(null)}
        onError={() => setPlayingId(null)}
      />
      <div role="tablist" aria-label="Coach personalities" className="coach-widget__tabs">
        {TABS.map((t) => {
          const count = coaches.filter((c) => c.category === t.id).length;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`coach-tabpanel-${t.id}`}
              id={`coach-tab-${t.id}`}
              tabIndex={isActive ? 0 : -1}
              className="coach-widget__tab"
              onClick={() => selectTab(t.id)}
            >
              <span className="coach-widget__tab-label">{t.label}</span>
              <span className="coach-widget__tab-count">{count}</span>
            </button>
          );
        })}
      </div>
      <ol
        role="tabpanel"
        id={`coach-tabpanel-${activeTab}`}
        aria-labelledby={`coach-tab-${activeTab}`}
        className="coach-widget__list"
      >
        {visible.map((c) => {
          const isPlaying = playingId === c.id;
          return (
            <li key={c.id} className="coach-widget__row">
              <div className="coach-widget__text">
                <p className="coach-widget__name">
                  {c.name}
                  {c.adult ? (
                    <span className="coach-widget__chip" aria-label="adult content">
                      18+
                    </span>
                  ) : null}
                </p>
                <p className="coach-widget__blurb">{c.blurb}</p>
              </div>
              <button
                type="button"
                className="coach-widget__btn"
                aria-pressed={isPlaying}
                aria-label={`${isPlaying ? "Pause" : "Play"} sample for ${c.name}`}
                onClick={() => handleClick(c.id)}
              >
                <span aria-hidden="true" className="coach-widget__glyph">
                  {isPlaying ? "❚❚" : "▶"}
                </span>
                <span className="coach-widget__btn-label">
                  {isPlaying ? "PAUSE" : "PLAY"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default CoachWidget;
