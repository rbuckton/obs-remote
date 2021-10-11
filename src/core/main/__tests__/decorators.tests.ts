import { expect, it, beforeEach, jest } from "@jest/globals";

beforeEach(() => {
    jest.resetModules();
});

it("when in renderer", async () => {
    jest.doMock("../main", () => ({ isInMain: () => true }));
    const { MainOnly } = await import("../decorators");

    @MainOnly
    class C {}

    expect(() => new C()).not.toThrow();
});

it("when not in renderer", async () => {
    jest.doMock("../main", () => ({ isInMain: () => false }));
    const { MainOnly } = await import("../decorators");

    @MainOnly
    class C {}

    expect(() => new C()).toThrow();
});