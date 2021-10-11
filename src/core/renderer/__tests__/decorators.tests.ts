import { expect, it, beforeEach, jest } from "@jest/globals";

beforeEach(() => {
    jest.resetModules();
});

it("when in renderer", async () => {
    jest.doMock("../renderer", () => ({ isInRenderer: () => true }));
    const { RendererOnly } = await import("../decorators");

    @RendererOnly
    class C {}

    expect(() => new C()).not.toThrow();
});

it("when not in renderer", async () => {
    jest.doMock("../renderer", () => ({ isInRenderer: () => false }));
    const { RendererOnly } = await import("../decorators");

    @RendererOnly
    class C {}

    expect(() => new C()).toThrow();
});