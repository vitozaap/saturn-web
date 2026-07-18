import { assertEvent, assign } from "xstate";
import { machine } from "./machine";


export const storeFile = machine.assign({
    file: ({ event }) => {
        assertEvent(event, "SUBMIT")
        return event.file
    },
    preset: ({ event }) => {
        assertEvent(event, "SUBMIT")
        return event.preset
    }
})

