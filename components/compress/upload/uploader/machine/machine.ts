import { setup } from "xstate";
import { createCompressionLogic, uploadFileLogic, confirmUploadLogic } from "./actors";
import { Context, Events } from "./types";


export const machine = setup({
    types: {
        context: {} as Context,
        events: {} as Events
    },
    actors: {
        createCompressionLogic,
        uploadFileLogic,
        confirmUploadLogic
    }
})