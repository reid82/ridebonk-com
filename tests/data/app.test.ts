import { describe, expect, it } from "vitest";
import { APP } from "../../src/data/app";

describe("APP", () => {
  it("points at the app Apple assigned us", () => {
    expect(APP.id).toBe("6762967904");
    expect(APP.storeUrl).toContain(APP.id);
  });

  it("is storefront-neutral so overseas visitors don't hit a redirect", () => {
    expect(APP.storeUrl).toBe(`https://apps.apple.com/app/id${APP.id}`);
    expect(APP.storeUrl).not.toMatch(/apps\.apple\.com\/[a-z]{2}\//);
  });

  it("describes a free app in a category Schema.org knows", () => {
    expect(APP.price).toBe("0");
    expect(APP.category).toBe("HealthApplication");
  });
});
