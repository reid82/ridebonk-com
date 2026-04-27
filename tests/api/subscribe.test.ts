import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSend = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

import { POST } from "../../src/pages/api/subscribe";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "vitest" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: "abc" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "test_key");
    vi.stubEnv("NOTIFY_EMAIL", "reid@example.com");
    vi.stubEnv("FROM_EMAIL", "from@example.com");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 400 for missing email", async () => {
    const res = await POST({ request: makeRequest({}) } as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed email", async () => {
    const res = await POST({ request: makeRequest({ email: "nope" }) } as never);
    expect(res.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 200 without sending when honeypot is filled", async () => {
    const res = await POST({
      request: makeRequest({ email: "rider@example.com", hp: "spam" }),
    } as never);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("forwards a valid email through Resend and returns 200", async () => {
    const res = await POST({
      request: makeRequest({ email: "rider@example.com", hp: "" }),
    } as never);
    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalledTimes(1);
    const args = mockSend.mock.calls[0][0];
    expect(args.to).toBe("reid@example.com");
    expect(args.from).toBe("from@example.com");
    expect(args.subject).toMatch(/ridebonk/i);
    expect(args.text).toContain("rider@example.com");
  });

  it("returns ok:false when Resend fails", async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const res = await POST({
      request: makeRequest({ email: "rider@example.com", hp: "" }),
    } as never);
    expect(res.status).toBe(502);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(false);
  });
});
