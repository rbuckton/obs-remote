import { IObsWebSocket, NullObsWebSocket } from ".";
import { BatchRequest, ObsWebSocketRequestArgs, ObsWebSocketRequests, ObsWebSocketResponse } from "../common/protocol";
import { Deferred } from "@esfx/async-deferred";

class ObsBatchRecorder extends NullObsWebSocket {
    readonly requests: BatchRequest<keyof ObsWebSocketRequests>[] = [];
    readonly deferreds = new Map<string, Deferred<any>>();

    private _nextMessageId = 1;

    send<K extends keyof ObsWebSocketRequests>(key: K, ...args: ObsWebSocketRequestArgs<K>): Promise<ObsWebSocketResponse<K>> {
        const messageId = `${this._nextMessageId++}`;
        const deferred = new Deferred<ObsWebSocketResponse<K>>();
        this.deferreds.set(messageId, deferred);
        this.requests.push({
            "request-type": key,
            "message-id": messageId,
            ...args[0]
        });
        return deferred.promise;
    }
}

export async function executeBatch(obs: IObsWebSocket, batchCallback: (obs: IObsWebSocket) => void | Promise<void>, abortOnFail?: boolean) {
    const recorder = new ObsBatchRecorder();
    const batchCallbackPromise = batchCallback(recorder);
    const requests = recorder.requests;
    const deferreds = new Map(recorder.deferreds);
    const { results } = await obs.send("ExecuteBatch", { requests: requests });
    const errors: any[] = [];
    for (const result of results) {
        const messageId = result["message-id"];
        const deferred = deferreds.get(messageId);
        if (!deferred) {
            errors.push(new Error(`Unexpected message id: ${messageId}`));
            continue;
        }
        else {
            deferreds.delete(messageId);
        }

        if (result.status === "error") {
            deferred.reject(new Error(result.error));
        }
        else {
            const response = Object.fromEntries(Object.entries(result).filter(([key]) => key !== "message-id" && key !== "status"));
            deferred.resolve(response);
        }
    }

    if (deferreds.size) {
        errors.push(new Error("Batch contained unhandled requests"));
        for (const deferred of deferreds.values()) {
            deferred.reject(new Error("Request not handled"));
        }
    }

    try {
        await batchCallbackPromise;
    }
    catch (e) {
        errors.push(e);
    }

    if (errors.length) {
        throw new AggregateError(errors);
    }
} 