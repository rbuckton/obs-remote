import { Disposable } from "@esfx/disposable";
import { describe, expect, it, jest } from "@jest/globals";
import * as main from "../../../core/main/main";
import { IpcServerSync } from "../server";
jest.mock("../../../core/main/main");

describe("Main", () => {
    let mockIpcMain: jest.Mocked<Electron.IpcMain>;

    beforeEach(() => {
        mockIpcMain = {
            on: jest.fn(),
            off: jest.fn(),
        } as jest.Mocked<Partial<Electron.IpcMain>> as jest.Mocked<Electron.IpcMain>;

        const mockMain = main as jest.Mocked<typeof main>;
        mockMain.isInMain.mockReturnValue(true);
        mockMain.getIpcMain.mockReturnValue(mockIpcMain);
    });

    afterEach(() => {
        mockIpcMain = undefined!;
    });

    it("calls ipcMain.on in constructor", () => {
        new IpcServerSync("foo", {});
        expect(mockIpcMain.on).toBeCalledWith("sync.message:foo", expect.any(Function));
        expect(mockIpcMain.on).toBeCalledTimes(1);
    });

    it("calls ipcMain.off when disposed", () => {
        const server = new IpcServerSync("foo", {});
        server[Disposable.dispose]();
        expect(mockIpcMain.off).toBeCalledWith("sync.message:foo", expect.any(Function));
        expect(mockIpcMain.off).toBeCalledTimes(1);
    });

    it("invokes contract when handler receives a message", () => {
        const fn = jest.fn().mockReturnValue(2);
        const server = new IpcServerSync("foo", { bar: fn });
        const handler = mockIpcMain.on.mock.calls[0][1];
        const event = {} as Electron.IpcMainEvent;
        handler(event, "bar", 1);
        expect(fn).toBeCalledWith(1);
        expect(event.returnValue).toBe(2);
    });
});

describe("Renderer", () => {
    beforeEach(() => {
        const mockMain = main as jest.Mocked<typeof main>;
        mockMain.isInMain.mockReturnValue(false);
        mockMain.getIpcMain.mockReturnValue(undefined!);
    });

    it("only valid on main", async () => {
        expect(() => new IpcServerSync("foo", {})).toThrow();
    });
});