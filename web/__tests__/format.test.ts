import { describe, it, expect } from "vitest";

import { formatNumber, formatPercent, formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("formats whole-dollar currency without decimals", () => {
    expect(formatPrice(250000)).toBe("$250,000");
    expect(formatPrice(0)).toBe("$0");
  });
});

describe("formatNumber", () => {
  it("groups thousands", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
});

describe("formatPercent", () => {
  it("defaults to one decimal", () => {
    expect(formatPercent(0.1234)).toBe("12.3%");
  });

  it("respects the digits argument", () => {
    expect(formatPercent(0.5, 0)).toBe("50%");
  });
});
