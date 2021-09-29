import { ServiceIdentifier } from "service-composition";
import { useAppContext } from "../utils/context";

export function useServices<T>(id: ServiceIdentifier<T>): T[] {
    const { serviceProvider } = useAppContext();
    return serviceProvider.getServices(id);
}

export function useService<T>(id: ServiceIdentifier<T>): T {
    const { serviceProvider } = useAppContext();
    return serviceProvider.getService(id);
}

export function useOptionalService<T>(id: ServiceIdentifier<T>): T | undefined {
    const { serviceProvider } = useAppContext();
    return serviceProvider.tryGetService(id);
}
