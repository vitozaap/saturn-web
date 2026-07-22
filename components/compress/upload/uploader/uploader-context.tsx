"use client"

import { createActorContext } from "@xstate/react"

import { uploaderMachine } from "./machine"

// One actor for the whole upload → compression → result flow. Leaves read
// only the slice of context/state they need via `UploaderContext.useSelector`
// instead of the whole snapshot — `UploaderContext.useActorRef()` never
// re-renders on its own, so it's safe wherever only `send`/`.on(...)` is
// needed (see uploader.tsx's emitted-event subscription).
export const UploaderContext = createActorContext(uploaderMachine)
