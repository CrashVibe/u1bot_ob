import {} from "@koishijs/cache";
import type { CachedRequest } from "./types";

export {};

declare module "@koishijs/cache" {
    interface Tables {
        "verifier:requests": CachedRequest;
    }
}
