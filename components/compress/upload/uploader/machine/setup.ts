import { setup } from "xstate";
import { createCompressionLogic, uploadFileLogic, confirmUploadLogic, downloadLogic, streamCompressionLogic } from "./actors";
import { Context, Emitted, Events } from "./types";

export const machine = setup({
    types: {
        context: {} as Context,
        events: {} as Events,
        emitted: {} as Emitted
    },
    actors: {
        createCompressionLogic,
        uploadFileLogic,
        confirmUploadLogic,
        downloadLogic,
        streamCompressionLogic
    }
})


