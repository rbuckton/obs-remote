import { describe, expect, it } from "@jest/globals";
import { PrivateField } from "../privateField";

describe("description", () => {
    it.each`
        input           | expected
        ${undefined}    | ${""}
        ${""}           | ${""}
        ${"id"}         | ${"id"}
        ${"$_0"}        | ${"$_0"}
        ${"non-id"}     | ${"non-id"}
    `("new PrivateField($input).description is $expected", ({ input, expected }) => {
        const p = new PrivateField(input);
        expect(p.description).toBe(expected);
    });
});

describe("name", () => {
    it.each`
        input           | expected
        ${undefined}    | ${`#<anonymous>`}
        ${""}           | ${`#<"">`}
        ${"id"}         | ${`#id`}
        ${"$_0"}        | ${`#$_0`}
        ${"non-id"}     | ${`#<"non-id">`}
    `("new PrivateField($input).name is $expected", ({ input, expected }) => {
        const p = new PrivateField(input);
        expect(p.name).toBe(expected);
    });
});

describe("has", () => {
    it("not defined", () => {
        const p = new PrivateField();
        const obj = {};
        expect(p.has(obj)).toBe(false);
    });
    it("defined", () => {
        const p = new PrivateField();
        const obj = {};
        p.define(obj);
        expect(p.has(obj)).toBe(true);
    });
});

it("get when not defined", () => {
    const p = new PrivateField();
    const obj = {};
    expect(() => p.get(obj)).toThrow();
});

it("set when not defined", () => {
    const p = new PrivateField();
    const obj = {};
    expect(() => p.set(obj, true)).toThrow();
});

it("define, set, get", () => {
    const p = new PrivateField();
    const obj = {};
    const value = {};
    expect(p.define(obj)).toBe(obj);
    expect(p.set(obj, value)).toBe(value);
    expect(p.get(obj)).toBe(value);
});