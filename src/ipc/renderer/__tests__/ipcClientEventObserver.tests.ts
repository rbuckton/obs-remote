import { Disposable } from "@esfx/disposable";
import { describe, expect, it, jest } from "@jest/globals";
import * as renderer from "../../../core/renderer/renderer";
import { IpcClientEventObserver } from "../client";
import { ContextifiedIpcRenderer } from "../../../services/ipc/renderer/contextifiedIpcRenderer";
jest.mock("../../../core/renderer/renderer");

describe("Main", () => {
    beforeEach(() => {
        const mockRenderer = renderer as jest.Mocked<typeof renderer>;
        mockRenderer.isInRenderer.mockReturnValue(false);
        mockRenderer.getIpcRenderer.mockReturnValue(undefined!);
    });

    it("only valid on renderer", () => {
        expect(() => new IpcClientEventObserver("foo")).toThrow();
    });
});

describe("Renderer", () => {
    let mockIpcRenderer: jest.Mocked<ContextifiedIpcRenderer>;

    beforeEach(() => {
        mockIpcRenderer = {
            invoke: jest.fn(),
            on: jest.fn(),
            send: jest.fn(),
            sendSync: jest.fn(),
            sendTo: jest.fn(),
            sendToHost: jest.fn(),
        } as typeof mockIpcRenderer;
        
        const mockRenderer = renderer as jest.Mocked<typeof renderer>;
        mockRenderer.isInRenderer.mockReturnValue(true);
        mockRenderer.getIpcRenderer.mockReturnValue(mockIpcRenderer);
    });

    afterEach(() => {
        mockIpcRenderer = undefined!;
    });

    it("subscribes during constructor", () => {
        const subscription = { unsubscribe: jest.fn() };
        mockIpcRenderer.on.mockReturnValueOnce(subscription);

        new IpcClientEventObserver<{ bar: (arg: number) => void}>("foo");
        expect(mockIpcRenderer.on).toBeCalledWith("event:foo", expect.any(Function));
    });

    it("sends event.subscribe on first subscription to event", () => {
        const subscription = { unsubscribe: jest.fn() };
        mockIpcRenderer.on.mockReturnValueOnce(subscription);

        const client = new IpcClientEventObserver<{ bar: () => void, baz: () => void }>("foo");
        client.on("bar", jest.fn());
        client.on("bar", jest.fn());
        client.on("baz", jest.fn());
        client.on("baz", jest.fn());
        expect(mockIpcRenderer.sendSync).toBeCalledWith("event.subscribe:foo", "bar");
        expect(mockIpcRenderer.sendSync).toBeCalledWith("event.subscribe:foo", "baz");
        expect(mockIpcRenderer.sendSync).toBeCalledTimes(2);
    });

    it("sends event.unsubscribe on last subscription to event", () => {
        const subscription = { unsubscribe: jest.fn() };
        mockIpcRenderer.on.mockReturnValueOnce(subscription);

        const client = new IpcClientEventObserver<{ bar: () => void, baz: () => void }>("foo");
        const handlers = [jest.fn(), jest.fn(), jest.fn(), jest.fn()] as const;
        client.on("bar", handlers[0]);
        client.on("bar", handlers[1]);
        client.on("baz", handlers[2]);
        client.on("baz", handlers[3]);
        mockIpcRenderer.sendSync.mockClear();

        client.off("bar", handlers[0]);
        client.off("baz", handlers[2]);
        expect(mockIpcRenderer.sendSync).not.toBeCalled();

        client.off("bar", handlers[1]);
        client.off("baz", handlers[3]);        

        expect(mockIpcRenderer.sendSync).toBeCalledWith("event.unsubscribe:foo", "bar");
        expect(mockIpcRenderer.sendSync).toBeCalledWith("event.unsubscribe:foo", "baz");
        expect(mockIpcRenderer.sendSync).toBeCalledTimes(2);
    });

    it("sends event.unsubscribe on dispose", () => {
        const subscription = { unsubscribe: jest.fn() };
        mockIpcRenderer.on.mockReturnValueOnce(subscription);

        const client = new IpcClientEventObserver<{ bar: () => void, baz: () => void }>("foo");
        const handlers = [jest.fn(), jest.fn(), jest.fn(), jest.fn()] as const;
        client.on("bar", handlers[0]);
        client.on("bar", handlers[1]);
        client.on("baz", handlers[2]);
        client.on("baz", handlers[3]);
        mockIpcRenderer.sendSync.mockClear();

        client[Disposable.dispose]();
        expect(mockIpcRenderer.sendSync).toBeCalledWith("event.unsubscribe:foo", "bar");
        expect(mockIpcRenderer.sendSync).toBeCalledWith("event.unsubscribe:foo", "baz");
        expect(mockIpcRenderer.sendSync).toBeCalledTimes(2);
    });

    it("unsubscribes from ipc on dispose", () => {
        const subscription = { unsubscribe: jest.fn() };
        mockIpcRenderer.on.mockReturnValueOnce(subscription);

        const client = new IpcClientEventObserver<{ bar: () => void, baz: () => void }>("foo");
        client[Disposable.dispose]();

        expect(subscription.unsubscribe).toBeCalledTimes(1);
    });

    it("raises event from ipc server", () => {
        const subscription = { unsubscribe: jest.fn() };
        mockIpcRenderer.on.mockReturnValueOnce(subscription);

        const client = new IpcClientEventObserver<{ bar: (arg: number) => void }>("foo");
        const listener = mockIpcRenderer.on.mock.calls[0][1];
        const handler = jest.fn();
        client.on("bar", handler);

        // trigger listener
        listener({ senderId: 0 } as Electron.IpcRendererEvent, "bar", 1);

        expect(handler).toBeCalledWith(1);
        expect(handler).toBeCalledTimes(1);
    });

    it("ignores event from other ipc source", () => {
        const subscription = { unsubscribe: jest.fn() };
        mockIpcRenderer.on.mockReturnValueOnce(subscription);

        const client = new IpcClientEventObserver<{ bar: (arg: number) => void }>("foo");
        const listener = mockIpcRenderer.on.mock.calls[0][1];
        const handler = jest.fn();
        client.on("bar", handler);

        // trigger listener
        listener({ senderId: 1 } as Electron.IpcRendererEvent, "bar", 1);

        expect(handler).toBeCalledTimes(0);
    });
});
