import { describe, expect, it, jest } from "@jest/globals";
import { IpcClientSync } from "..";
import * as renderer from "../../../core/renderer/renderer";
import { ContextifiedIpcRenderer } from "../contextifiedIpcRenderer";
jest.mock("../../../core/renderer/renderer");

describe("Main", () => {
    beforeEach(() => {
        const mockRenderer = renderer as jest.Mocked<typeof renderer>;
        mockRenderer.isInRenderer.mockReturnValue(false);
        mockRenderer.getIpcRenderer.mockReturnValue(undefined!);
    });
    
    it("only valid on renderer", async () => {
        expect(() => new IpcClientSync("foo")).toThrow();
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

    it("sends message on channel", async () => {
        const client = new IpcClientSync<{ bar: (arg: number) => void}>("foo");
        client.sendSync("bar", 1);
    
        expect(mockIpcRenderer.sendSync).toBeCalledWith("sync.message:foo", "bar", 1);
    });
});
