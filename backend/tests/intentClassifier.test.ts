import { describe, expect, it } from "vitest";
import { classifyIntent } from "../src/utils/intentClassifier";

describe("classifyIntent", () => {
  it("routes order-related phrases to order", () => {
    expect(classifyIntent("Where is my order?")).toBe("order");
    expect(classifyIntent("tracking TRACK101")).toBe("order");
  });

  it("routes billing phrases to billing", () => {
    expect(classifyIntent("refund please")).toBe("billing");
    expect(classifyIntent("payment failed")).toBe("billing");
  });

  it("routes support phrases to support", () => {
    expect(classifyIntent("help me")).toBe("support");
    expect(classifyIntent("support needed")).toBe("support");
  });
});
