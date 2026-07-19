import { createInitialContext } from "./actions";
import { machine } from "./setup";
import { completed, compressing, confirming, creating, downloading, error, idle, uploading } from "./states";

export const uploaderMachine = machine.createMachine({
    id: "uploader",
    context: createInitialContext,
    states: {
        idle,
        creating,
        uploading,
        confirming,
        compressing,
        downloading,
        error,
        completed
    },
    initial: "idle"
})