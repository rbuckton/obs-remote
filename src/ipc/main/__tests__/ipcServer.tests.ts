import { Disposable } from "@esfx/disposable";
import { describe, expect, it, jest } from "@jest/globals";
import * as main from "../../../core/main/main";
import { IpcServer } from "../server";
jest.mock("../../../core/main/main");

describe("Main", () => {
    let mockIpcMain: jest.Mocked<Electron.IpcMain>;

    beforeEach(() => {
        mockIpcMain = {
            handle: jest.fn(),
            removeHandler: jest.fn(),
        } as jest.Mocked<Partial<Electron.IpcMain>> as jest.Mocked<Electron.IpcMain>;

        const mockMain = main as jest.Mocked<typeof main>;
        mockMain.isInMain.mockReturnValue(true);
        mockMain.getIpcMain.mockReturnValue(mockIpcMain);
    });

    afterEach(() => {
        mockIpcMain = undefined!;
    });

    it("calls ipcMain.handle in constructor", () => {
        new IpcServer("foo", {});
        expect(mockIpcMain.handle).toBeCalledWith("message:foo", expect.any(Function));
        expect(mockIpcMain.handle).toBeCalledTimes(1);
    });

    it("calls ipcMain.removeHandler when disposed", () => {
        const server = new IpcServer("foo", {});
        server[Disposable.dispose]();
        expect(mockIpcMain.removeHandler).toBeCalledWith("message:foo");
        expect(mockIpcMain.removeHandler).toBeCalledTimes(1);
    });

    it("invokes contract when handler receives a message", async () => {
        const fn = jest.fn().mockReturnValue(2);
        const server = new IpcServer("foo", { bar: fn });
        const handler = mockIpcMain.handle.mock.calls[0][1];
        const result = handler({} as Electron.IpcMainInvokeEvent, "bar", 1);
        expect(fn).toBeCalledWith(1);
        await expect(result).resolves.toBe(2);
    });
});

describe("Renderer", () => {
    beforeEach(() => {
        const mockMain = main as jest.Mocked<typeof main>;
        mockMain.isInMain.mockReturnValue(false);
        mockMain.getIpcMain.mockReturnValue(undefined!);
    });

    it("only valid on main", async () => {
        expect(() => new IpcServer("foo", {})).toThrow();
    });
});