import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoachWidget, type CoachCardData } from "../../src/components/CoachWidget";

const fixtures: CoachCardData[] = [
  { id: "sergeant", name: "Sergeant Steel", voiceLabel: "Adam (deep)", blurb: "Drill-sergeant." },
  { id: "mate", name: "Mate", voiceLabel: "Charlie (Aussie)", blurb: "Aussie buddy." },
  { id: "wade", name: "Wade", voiceLabel: "Clyde (wry)", blurb: "Unhinged.", adult: true },
];

beforeEach(() => {
  // jsdom doesn't implement play/pause; stub them out.
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

describe("CoachWidget", () => {
  it("renders every coach name", () => {
    render(<CoachWidget coaches={fixtures} />);
    for (const c of fixtures) {
      expect(screen.getByText(c.name)).toBeInTheDocument();
    }
  });

  it("renders the voice label and blurb for each coach", () => {
    render(<CoachWidget coaches={fixtures} />);
    expect(screen.getByText("Adam (deep)")).toBeInTheDocument();
    expect(screen.getByText("Drill-sergeant.")).toBeInTheDocument();
  });

  it("shows an 18+ chip on adult coaches only", () => {
    render(<CoachWidget coaches={fixtures} />);
    const chips = screen.getAllByText("18+");
    expect(chips).toHaveLength(1);
  });

  it("clicking play sets the audio src to the right file and plays", () => {
    render(<CoachWidget coaches={fixtures} />);
    const btn = screen.getByRole("button", { name: /play sample for sergeant steel/i });
    fireEvent.click(btn);
    const audio = document.querySelector("audio") as HTMLAudioElement;
    expect(audio.src).toMatch(/\/voice\/coaches\/sergeant\.mp3$/);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("clicking the active coach a second time pauses", () => {
    render(<CoachWidget coaches={fixtures} />);
    const btn = screen.getByRole("button", { name: /play sample for sergeant steel/i });
    fireEvent.click(btn);
    // After first click, button label flips to pause.
    const pauseBtn = screen.getByRole("button", { name: /pause sample for sergeant steel/i });
    fireEvent.click(pauseBtn);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    // Back to play label.
    expect(screen.getByRole("button", { name: /play sample for sergeant steel/i })).toBeInTheDocument();
  });

  it("clicking a different coach swaps the audio src and keeps playing", () => {
    render(<CoachWidget coaches={fixtures} />);
    fireEvent.click(screen.getByRole("button", { name: /play sample for sergeant steel/i }));
    fireEvent.click(screen.getByRole("button", { name: /play sample for mate/i }));
    const audio = document.querySelector("audio") as HTMLAudioElement;
    expect(audio.src).toMatch(/\/voice\/coaches\/mate\.mp3$/);
    // Sergeant's button is back to idle (play label).
    expect(screen.getByRole("button", { name: /play sample for sergeant steel/i })).toBeInTheDocument();
  });

  it("aria-pressed reflects which coach is playing", () => {
    render(<CoachWidget coaches={fixtures} />);
    const sergeantBtn = screen.getByRole("button", { name: /play sample for sergeant steel/i });
    expect(sergeantBtn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(sergeantBtn);
    const pauseBtn = screen.getByRole("button", { name: /pause sample for sergeant steel/i });
    expect(pauseBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("when audio ends, the active button resets", () => {
    render(<CoachWidget coaches={fixtures} />);
    fireEvent.click(screen.getByRole("button", { name: /play sample for sergeant steel/i }));
    const audio = document.querySelector("audio") as HTMLAudioElement;
    fireEvent.ended(audio);
    expect(screen.getByRole("button", { name: /play sample for sergeant steel/i })).toBeInTheDocument();
  });
});
