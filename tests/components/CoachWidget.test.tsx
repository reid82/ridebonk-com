import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoachWidget, type CoachCardData } from "../../src/components/CoachWidget";

const fixtures: CoachCardData[] = [
  { id: "sergeant", name: "Sergeant Steel", voiceLabel: "Adam (deep)", blurb: "Drill-sergeant.", category: "tough" },
  { id: "headmistress", name: "The Headmistress", voiceLabel: "Alice", blurb: "Posh disappointment.", category: "tough" },
  { id: "mate", name: "Mate", voiceLabel: "Charlie (Aussie)", blurb: "Aussie buddy.", category: "banter" },
  { id: "wade", name: "Wade", voiceLabel: "Clyde (wry)", blurb: "Unhinged.", adult: true, category: "banter" },
  { id: "clinical", name: "Dr. Hodges", voiceLabel: "Daniel", blurb: "Numbers.", category: "pro" },
];

beforeEach(() => {
  // jsdom doesn't implement play/pause; stub them out.
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

describe("CoachWidget", () => {
  it("renders only coaches in the default (tough) tab", () => {
    render(<CoachWidget coaches={fixtures} />);
    expect(screen.getByText("Sergeant Steel")).toBeInTheDocument();
    expect(screen.getByText("The Headmistress")).toBeInTheDocument();
    expect(screen.queryByText("Mate")).not.toBeInTheDocument();
    expect(screen.queryByText("Dr. Hodges")).not.toBeInTheDocument();
  });

  it("switching tabs swaps the visible coaches", () => {
    render(<CoachWidget coaches={fixtures} />);
    fireEvent.click(screen.getByRole("tab", { name: /banter/i }));
    expect(screen.getByText("Mate")).toBeInTheDocument();
    expect(screen.getByText("Wade")).toBeInTheDocument();
    expect(screen.queryByText("Sergeant Steel")).not.toBeInTheDocument();
  });

  it("renders the blurb for each visible coach", () => {
    render(<CoachWidget coaches={fixtures} />);
    expect(screen.getByText("Drill-sergeant.")).toBeInTheDocument();
    expect(screen.getByText("Posh disappointment.")).toBeInTheDocument();
  });

  it("shows an 18+ chip on adult coaches in their tab", () => {
    render(<CoachWidget coaches={fixtures} />);
    expect(screen.queryByText("18+")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /banter/i }));
    expect(screen.getAllByText("18+")).toHaveLength(1);
  });

  it("shows a count per tab", () => {
    render(<CoachWidget coaches={fixtures} />);
    const toughTab = screen.getByRole("tab", { name: /tough/i });
    expect(toughTab.textContent).toContain("2");
    const banterTab = screen.getByRole("tab", { name: /banter/i });
    expect(banterTab.textContent).toContain("2");
    const proTab = screen.getByRole("tab", { name: /pro/i });
    expect(proTab.textContent).toContain("1");
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
    const pauseBtn = screen.getByRole("button", { name: /pause sample for sergeant steel/i });
    fireEvent.click(pauseBtn);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /play sample for sergeant steel/i })).toBeInTheDocument();
  });

  it("clicking a different coach in the same tab swaps the audio src", () => {
    render(<CoachWidget coaches={fixtures} />);
    fireEvent.click(screen.getByRole("button", { name: /play sample for sergeant steel/i }));
    fireEvent.click(screen.getByRole("button", { name: /play sample for the headmistress/i }));
    const audio = document.querySelector("audio") as HTMLAudioElement;
    expect(audio.src).toMatch(/\/voice\/coaches\/headmistress\.mp3$/);
    expect(screen.getByRole("button", { name: /play sample for sergeant steel/i })).toBeInTheDocument();
  });

  it("switching tabs pauses any currently-playing coach", () => {
    render(<CoachWidget coaches={fixtures} />);
    fireEvent.click(screen.getByRole("button", { name: /play sample for sergeant steel/i }));
    fireEvent.click(screen.getByRole("tab", { name: /banter/i }));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
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
