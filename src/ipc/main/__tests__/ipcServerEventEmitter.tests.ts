import { Disposable } from "@esfx/disposable";
import { describe, expect, it, jest } from "@jest/globals";
import * as main from "../../../core/main/main";
import { IpcServerEventEmitter } from "../server";
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
        new IpcServerEventEmitter("foo");
        expect(mockIpcMain.on).toBeCalledWith("event.subscribe:foo", expect.any(Function));
        expect(mockIpcMain.on).toBeCalledWith("event.unsubscribe:foo", expect.any(Function));
        expect(mockIpcMain.on).toBeCalledTimes(2);
    });

    it("calls ipcMain.off when disposed", () => {
        const emitter = new IpcServerEventEmitter("foo");
        emitter[Disposable.dispose]();
        expect(mockIpcMain.off).toBeCalledWith("event.subscribe:foo", expect.any(Function));
        expect(mockIpcMain.off).toBeCalledWith("event.unsubscribe:foo", expect.any(Function));
        expect(mockIpcMain.off).toBeCalledTimes(2);
    });

    it("calls ipcMain.off only once for each channel when disposed", () => {
        const emitter = new IpcServerEventEmitter("foo");
        emitter[Disposable.dispose]();
        emitter[Disposable.dispose]();
        expect(mockIpcMain.off).toBeCalledWith("event.subscribe:foo", expect.any(Function));
        expect(mockIpcMain.off).toBeCalledWith("event.unsubscribe:foo", expect.any(Function));
        expect(mockIpcMain.off).toBeCalledTimes(2);
    });

    it("does not emit when no subscribers connected", () => {
        const emitter = new IpcServerEventEmitter<{ bar: (arg: number) => void }>("foo");
        expect(emitter.emit("bar", 1)).toBe(false);
    });

    it("adds subscriber when connected", () => {
        const emitter = new IpcServerEventEmitter<{ bar: (arg: number) => void }>("foo");
        const subscribeHandler = mockIpcMain.on.mock.calls[0][1];

        // register listener
        const mockSender = {
            id: 1,
            send: jest.fn() as Electron.WebContents["send"],
        } as Electron.WebContents;

        const mockEvent = {
            returnValue: undefined,
            sender: mockSender
        } as Electron.IpcMainEvent;
        
        subscribeHandler(mockEvent, "bar");

        expect(mockEvent.returnValue).toBe(true);
    });

    it("adds subscriber only once when connected", () => {
        const emitter = new IpcServerEventEmitter<{ bar: (arg: number) => void }>("foo");
        const subscribeHandler = mockIpcMain.on.mock.calls[0][1];

        // register listener
        const mockSender = {
            id: 1,
            send: jest.fn() as Electron.WebContents["send"],
        } as Electron.WebContents;

        const mockEvent1 = {
            returnValue: undefined,
            sender: mockSender
        } as Electron.IpcMainEvent;
        
        subscribeHandler(mockEvent1, "bar");

        const mockEvent2 = {
            returnValue: undefined,
            sender: mockSender
        } as Electron.IpcMainEvent;
        
        subscribeHandler(mockEvent2, "bar");

        expect(mockEvent2.returnValue).toBe(false);
    });

    it("removes subscriber when disconnected", () => {
        const emitter = new IpcServerEventEmitter<{ bar: (arg: number) => void }>("foo");
        const subscribeHandler = mockIpcMain.on.mock.calls[0][1];
        const unsubscribeHandler = mockIpcMain.on.mock.calls[1][1];

        // register listener
        const mockSender = {
            id: 1,
            send: jest.fn() as Electron.WebContents["send"],
        } as Electron.WebContents;

        const mockEvent1 = {
            returnValue: undefined,
            sender: mockSender
        } as Electron.IpcMainEvent;
        
        subscribeHandler(mockEvent1, "bar");
        
        const mockEvent2 = {
            returnValue: undefined,
            sender: mockSender
        } as Electron.IpcMainEvent;
        unsubscribeHandler(mockEvent2, "bar");
        
        expect(mockEvent2.returnValue).toBe(true);
    });

    it("removes subscriber only once when disconnected", () => {
        const emitter = new IpcServerEventEmitter<{ bar: (arg: number) => void }>("foo");
        const subscribeHandler = mockIpcMain.on.mock.calls[0][1];
        const unsubscribeHandler = mockIpcMain.on.mock.calls[1][1];

        // register listener
        const mockSender = {
            id: 1,
            send: jest.fn() as Electron.WebContents["send"],
        } as Electron.WebContents;

        const mockEvent1 = {
            returnValue: undefined,
            sender: mockSender
        } as Electron.IpcMainEvent;
        
        subscribeHandler(mockEvent1, "bar");
        
        const mockEvent2 = {
            returnValue: undefined,
            sender: mockSender
        } as Electron.IpcMainEvent;

        unsubscribeHandler(mockEvent2, "bar");

        const mockEvent3 = {
            returnValue: undefined,
            sender: mockSender
        } as Electron.IpcMainEvent;

        unsubscribeHandler(mockEvent3, "bar");
        
        expect(mockEvent3.returnValue).toBe(false);
    });

    it("emits when subscriber connected", () => {
        const emitter = new IpcServerEventEmitter<{ bar: (arg: number) => void }>("foo");
        const subscribeHandler = mockIpcMain.on.mock.calls[0][1];

        // register listener
        const mockSender = {
            id: 1,
            send: jest.fn() as Electron.WebContents["send"],
        } as Electron.WebContents;

        const mockEvent = {
            returnValue: undefined,
            sender: mockSender
        } as Electron.IpcMainEvent;
        
        subscribeHandler(mockEvent, "bar");

        expect(emitter.emit("bar", 1)).toBe(true);
        expect(mockSender.send).toBeCalledWith("event:foo", "bar", 1);
        expect(mockSender.send).toBeCalledTimes(1);
    });

    it("throws on emit if disposed", () => {
        const emitter = new IpcServerEventEmitter<{ bar: (arg: number) => void }>("foo");
        emitter[Disposable.dispose]();

        expect(() => emitter.emit("bar", 1)).toThrow();
    });
});

describe("Renderer", () => {
    beforeEach(() => {
        const mockMain = main as jest.Mocked<typeof main>;
        mockMain.isInMain.mockReturnValue(false);
        mockMain.getIpcMain.mockReturnValue(undefined!);
    });

    it("only valid on main", async () => {
        expect(() => new IpcServerEventEmitter("foo")).toThrow();
    });
});