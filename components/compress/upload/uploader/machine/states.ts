import { assign } from "xstate";
import { machine } from "./machine";



export const idle = machine.createStateConfig({
    on: {
        SUBMIT: {
            target: "creating",
            actions: assign({
                file: ({ event }) => event.file,
                preset: ({ event }) => event.preset
            })
        }
    }
})

export const creating = machine.createStateConfig({
    invoke: {
        src: 'createCompressionLogic',
        input: ({ context }) => ({
            preset: context.preset,
            contentType: context.file.type,
            filename: context.file.name
        }),
        onDone: {
            target: "uploading",
            actions: assign({
                compressionId: ({ event }) => event.output.compressionId,
                uploadUrl: ({ event }) => event.output.uploadUrl
            })
        },
        onError: {
            target: "failed",
            actions: assign({
                error: ({ event }) => (event.error as Error).message
            })
        }
    }
})

export const uploading = machine.createStateConfig({
    invoke: {
        src: "uploadFileLogic",
        input: ({ context }) => ({
            file: context.file,
            uploadUrl: context.uploadUrl!
        })
    }
})

export const confirming = machine.createStateConfig({
    invoke: {
        src: 'confirmUploadLogic',
        input: ({ context }) => ({
            compressionId: context.compressionId!
        }),
    }
})