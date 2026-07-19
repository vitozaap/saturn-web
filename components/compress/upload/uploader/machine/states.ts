import { assign, emit } from "xstate";
import { machine } from "./setup";
import { clearRun, resetAll, resetProgress, storeCompression, storeStatusError, storeStreamError } from "./actions";



export const idle = machine.createStateConfig({
    entry: resetAll,
    on: {
        SUBMIT: {
            target: "creating",
            actions: assign({
                file: ({ event }) => event.file,
                preset: ({ event }) => event.preset
            })
        }
    },
})

export const creating = machine.createStateConfig({
    entry: clearRun,
    invoke: {
        src: 'createCompressionLogic',
        input: ({ context }) => ({
            preset: context.preset,
            contentType: context.file!.type,
            filename: context.file!.name
        }),
        onDone: {
            target: "uploading",
            actions: assign({
                compressionId: ({ event }) => event.output.compressionId,
                uploadUrl: ({ event }) => event.output.uploadUrl
            })
        },
        onError: {
            target: "error",
            actions: assign({
                error: ({ event }) => (event.error as Error).message
            })
        }
    }
})

export const uploading = machine.createStateConfig({
    entry: resetProgress,
    invoke: {
        src: "uploadFileLogic",
        input: ({ context }) => ({
            file: context.file!,
            uploadUrl: context.uploadUrl!
        }),
    },
    on: {
        CANCEL: "idle",
        UPLOAD_ERROR: {
            target: "error",
            actions: assign({
                error: ({ event }) => event.message
            })
        },
        UPLOAD_PROGRESS: {
            actions: assign(({ event }) => ({
                uploadedPercent: event.percent
            }))
        },
        UPLOAD_DONE: "confirming"
    }
})

export const confirming = machine.createStateConfig({

    invoke: {
        src: 'confirmUploadLogic',
        input: ({ context }) => ({
            compressionId: context.compressionId!
        }),
        onDone: {
            target: "compressing"
        },
        onError: {
            target: "error",
            actions: assign({
                error: ({ event }) => (event.error as Error).message
            })
        }
    }
})

export const compressing = machine.createStateConfig({
    invoke: {
        src: "streamCompressionLogic",
        input: ({ context }) => ({
            compressionId: context.compressionId!
        })
    },
    initial: "streaming",
    states: {
        streaming: {
            on: {
                STREAM_ERROR: "reconnecting"
            }
        },
        reconnecting: {
            // Internal on purpose: EventSource fires onerror on every failed
            // retry. With a target, each one would re-enter and restart the timer.
            on: {
                STREAM_ERROR: {}
            },
            after: {
                15000: {
                    target: "#uploader.error", actions: storeStreamError
                }
            }
        }
    },
    on: {
        "STATUS": [{
            guard: ({ event }) => event.compression.status === "COMPLETED",
            target: "completed",
            actions: storeCompression
        },
        {
            guard: ({ event }) =>
                event.compression.status === "FAILED" ||
                event.compression.status === "EXPIRED",
            target: "error",
            actions: storeStatusError
        },
        // This means we are still in the "PROCESSING" state, so we still here.
        {
            target: ".streaming",
            actions: storeCompression
        }
        ],
    }
})

export const downloading = machine.createStateConfig({
    invoke: {
        src: "downloadLogic",
        input: ({ context }) => ({ compressionId: context.compressionId! }),
        onDone: {
            target: "completed",
            // The URL goes straight to the component instead of into context:
            // it expires, and nothing on screen reads it.
            actions: emit(({ event }) => ({ type: "download", url: event.output }))
        },
        onError: {
            target: "completed",
            actions: emit({ type: "notify", message: "Não foi possível realizar o download. Tente novamente mais tarde." })
        }
    }
})

export const completed = machine.createStateConfig({
    on: {
        RESET: "idle",
        DOWNLOAD: "downloading"
    }
})


export const error = machine.createStateConfig({
    on: {
        "RESET": {
            target: "idle"
        },
        "RETRY": {
            target: "creating"
        }
    }
})