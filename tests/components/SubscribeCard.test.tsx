import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubscribeCard } from "../../src/components/SubscribeCard";

describe("SubscribeCard", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the headline and an email input", () => {
    render(<SubscribeCard />);
    expect(screen.getByRole("heading", { name: /want to try it/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /subscribe/i })).toBeInTheDocument();
  });

  it("posts to /api/subscribe and shows the thanks state on success", async () => {
    const user = userEvent.setup();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<SubscribeCard />);
    await user.type(screen.getByLabelText(/email/i), "rider@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(() =>
      expect(screen.getByText(/got it\. i'll be in touch\./i)).toBeInTheDocument(),
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/subscribe",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    const body = JSON.parse(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.email).toBe("rider@example.com");
    expect(body.hp).toBe("");
  });

  it("disables the submit button while submitting", async () => {
    const user = userEvent.setup();
    let resolveFetch: (v: unknown) => void = () => {};
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((resolve) => { resolveFetch = resolve; }),
    );

    render(<SubscribeCard />);
    await user.type(screen.getByLabelText(/email/i), "rider@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

    resolveFetch({ ok: true, json: async () => ({ ok: true }) });
  });

  it("shows an error message when the request fails", async () => {
    const user = userEvent.setup();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false }),
    });

    render(<SubscribeCard />);
    await user.type(screen.getByLabelText(/email/i), "rider@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(() =>
      expect(screen.getByText(/something broke/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /subscribe/i })).not.toBeDisabled();
  });
});
