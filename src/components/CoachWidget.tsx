import { useRef, useState } from "react";

export interface CoachCardData {
  id: string;
  name: string;
  voiceLabel: string;
  blurb: string;
  adult?: boolean;
}

interface Props {
  coaches: CoachCardData[];
}

export function CoachWidget({ coaches }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null);
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

  return (
    <div className="coach-widget">
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlayingId(null)}
        onError={() => setPlayingId(null)}
      />
      <ol className="coach-widget__list">
        {coaches.map((c) => {
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
                <p className="coach-widget__voice mono">{c.voiceLabel}</p>
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
