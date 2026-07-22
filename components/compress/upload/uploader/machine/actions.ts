import { assertEvent } from "xstate";
import { machine } from "./setup";
import { Context } from "./types";

// Single source of truth for a blank context. Used both as the machine's initial
// context and by `resetAll`, so the two can never drift apart.
export const createInitialContext = (): Context => ({
    file: null,
    preset: "MID",
    compressionId: null,
    uploadUrl: null,
    uploadedPercent: 0,
    compression: null,
    error: null,
})

export const createRetryContext = ({ file, preset }: Context): Context => ({
    ...createInitialContext(),
    file,
    preset,
})


// Wipes every field. Entry of `idle`.
export const resetAll = machine.assign(createInitialContext)

// Entry of `uploading`, so a retry never starts at the previous run's percentage.
export const resetProgress = machine.assign({ uploadedPercent: 0 })

// Entry of `creating`, covering arrival from both `idle` and `error`.
export const clearRun = machine.assign(({ context }) => createRetryContext(context))


export const storeCompression = machine.assign({
    compression: ({ event }) => {
        assertEvent(event, "STATUS")
        return event.compression
    }
})

export const storeStreamError = machine.assign({
    error: "Perdemos a conexão. Tente novamente."
})

export const storeStatusError = machine.assign({
    error: ({ event }) => {
        assertEvent(event, "STATUS")
        return event.compression.status === "EXPIRED"
            ? "Sua compressão expirou ou o arquivo está indisponível"
            : "Não foi possível concluir a compressão. Tente novamente."
    }
})