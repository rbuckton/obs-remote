# Architecture Overview

## Thread Isolation

`obs-remote` is an electron app, and is therefore split between the electron Main thread and the Renderer thread. We enforce this separation, physically (via directory structure) as well as visually and semantically (via decorators).

### Physical Separation

Component services are generally stored under individual directories under `~/src`, usually with three subdirectories (as needed):
- `./main/` &mdash; Components/Services intended for use in the electron Main thread.
- `./renderer/` &mdash; Components/Services intended for use in the electron Renderer thread.
- `./common/` &mdash; Common components/interfaces/protocols used both in the Main and Renderer threads.

### Semantic Separation

Services designed to work only on the main thread are annotated with a `@MainOnly` decorator, while services designed to work only in a render thread are annotated with a `@RenderOnly` decorator. These decorator not only provides a visual cue that the service is intended to operate in a specific thread, but also enforce that requirement at runtime.

- [`MainOnly` decorator](./core/main/decorators.ts)
- [`RendererOnly` decorator](./core/renderer/decorators.ts)

In addition, a class marked as an `@IpcServerClass` is implicitly marked with a `@MainOnly` decorator, and a class marked as an `@IpcClientClass` is implicitly marked with a `@RendererOnly` decorator.

## Services and Composition

`obs-remote` is an application composed of various components and services. The application leverages dependency injection via [`service-composition`](https://npmjs.org/package/service-composition), which uses decorators to annotate constructor parameters and fields into which components should be injected. We chose this approach for several reasons:

- Component/service-level isolation &mdash; Limits reponsibilities within the application to smaller units of work.
- Testability &mdash; Using dependency injection allows us to test components/services individually using mock objects to exercise related scenarios.
- Plugability &mdash; In the future we may implement support for user-defined plugins to extend functionality using a composition-like approach.

### Defining a Service

To define a composable service, we first define an interface that describes that service. For example:

```ts
import { Event } from "@esfx/events";

export interface IPreferencesService {
    readonly onDidChange: Event<(key: PreferenceKeys) => void>;
    theme: ThemeKind;
    hostname: string;
    port: number;
    authKey: string;
    autoConnect: boolean;
    clear(): void;
}

export type PreferenceKeys =
    | "theme"
    | "hostname"
    | "port"
    | "authKey"
    | "autoConnect"
    ;
```

Next, we allocate a `ServiceIdentifier` that identifies the service:

```ts
import { ServiceIdentifier } from "service-composition";

export const IPreferencesService = ServiceIdentifier.create<IPreferencesService>("IPreferencesService");
```

This establishes a runtime value that uniquely identifies the design-time interface. A `ServiceIdentifier` is also a decorator, and can be used do to decorate constructor parameters in TypeScript, as well as class fields:

```ts
import { IPreferencesService } from "path/to/preferencesService.ts";

export class MyService {
    constructor(
        @IPreferencesService preferences: IPreferencesService
    ) {
        ...
    }
}
```

Now that we have a service interface and service identifier, we can implement the runtime interface:

```ts
import { IPreferencesService } from "../common/preferencesService.ts";

export class MyPreferencesService implements IPreferencesService {
    ...
}
```

Finally, we can add the service to our composition container, depending on whether we are on the electron Main thread or the Renderer thread:

- [Main thread](./main.ts)
- [Renderer thread](./renderer.tsx)

### Services and React 

For React components, we employ a `useService` hook that can be used inside a React function component:

```tsx
import { useService } from "../hooks/useService";

export function usePreference<K extends PreferenceKeys>(key: K) {
    const preferences = useService(IPreferencesService);
    const [value, setValue] = useState(() => preferences[key]);
    useEffect(() => {
        const onDidPreferenceChange = (_key: PreferenceKeys) => {
            if (_key === key) {
                setValue(preferences[key]);
            }
        };
        preferences.onDidChange.on(onDidPreferenceChange);
        return () => { preferences.onDidChange.off(onDidPreferenceChange); };
    }, [preferences, setValue]);
    return value;
}
```

## IPC between Main and Render threads

To facilitate typed IPC calls between the Main and Render threads, we employ two families of decorators:

- [`IpcServerDecorators`](./ipc/main/decorators.ts)
- [`IpcClientDecorators`](./ipc/renderer/decorators.ts)

### IPC Server

To create an IPC server on the electron Main thread, you call `IpcServerDecorators.create` with a channel name. This results in four decorators you can apply to your service:

- `IpcServerClass` &mdash; Marks the class as an IPC Server and performs the runtime logic necessary to register the class as an IPC server upon construction.
- `IpcServerMethod` &mdash; Marks a method on a class as an IPC Server method that can be invoked by an IPC client asynchronously.
- `IpcServerSyncMethod` &mdash; Marks a method on a class as an IPC Server method that can be invoked by an IPC client synchronously.
- `IpcServerEvent` &mdash; Marks an `Event` field as an IPC Server event that will raise events on an IPC client when triggered.

### IPC Client

An IPC Client is created on the electron Renderer thread and interacts with an IPC Server. You define an IPC Client using  `IpcClientDecorators.create` with the same channel name specified on the server. This again results in four decorators you can apply to your Renderer thread service:

- `IpcClientClass` &mdash; Marks the class as an IPC Client and performs the runtime logic necessary to register the class as an IPC client upon construction.
- `IpcClientMethod` &mdash; Marks a method on a class as an IPC Client method that invokes an IPC Server method asynchronously.
- `IpcClientSyncMethod` &mdash;  Marks a method on a class as an IPC Client method that invokes an IPC Server method synchronously.
- `IpcClientEvent` &mdash; Marks an `Event` field as the receiver of IPC server events.