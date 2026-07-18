# Uploader machine

XState v5 state machine that drives the whole compression flow: create → upload →
confirm → queue → process → download.

Written in English per the repo convention (only `docs/` is Portuguese). User-facing
strings inside the machine stay in Portuguese.

## Why a machine

The flow is not a linear sequence of three fetches. It has rules that a boolean
`isLoading` cannot express:

- **Cancel exists only during the S3 upload.** In the machine, `CANCEL` is a transition
  that only exists on the `uploading` state, so an illegal cancel is impossible rather
  than a bug to guard against.
- **Two different progress bars.** `uploading` has a real percentage; `compressing` is
  indeterminate. Which bar renders is derived from the state, not from flags.
- **Retry resumes from the right step**, reusing the file already in context.
- **Every async resource is tied to a state.** Leaving a state stops its invoked actor,
  which aborts the XHR and closes the EventSource with no manual cleanup.

## File layout

| File | Holds |
|---|---|
| `machine.ts` | `setup()` — context/events types, actor registry |
| `actors.ts` | Actor logic wrapping `lib/api.ts` |
| `actions.ts` | Named actions (context writes) |
| `states.ts` | One exported state config per state |

`states.ts` uses `machine.createStateConfig(...)`, which is an identity function at
runtime — it exists purely so each state gets the setup's types.

---

## Context

| Field | Type | Written by |
|---|---|---|
| `file` | `File \| null` | `SUBMIT` event |
| `preset` | `Preset` | `SUBMIT` event |
| `compressionId` | `string \| null` | `onDone` of `createCompressionLogic` |
| `uploadUrl` | `string \| null` | `onDone` of `createCompressionLogic` |
| `uploadedPercent` | `number` | `UPLOAD_PROGRESS` event |
| `compression` | `Compression \| null` | `STATUS` event (SSE payload) |
| `downloadUrl` | `string \| null` | `onDone` of `getDownloadUrlLogic` |
| `error` | `string \| null` | any error path — Portuguese, UI-ready |

Types come from `lib/types.ts`. Do not redeclare them.

> `file` must be `File | null`, not `File`. The machine starts in `idle` with no file.
> Typing it non-null makes the initial context a lie and pushes the error somewhere
> less obvious.

## Events

**From the UI** (`send`):

- `SUBMIT` — `{ file: File; preset: Preset }`
- `CANCEL`
- `RETRY`
- `RESET`
- `DOWNLOAD`

**From child actors** (`sendBack`):

- `UPLOAD_PROGRESS` — `{ percent: number }`
- `UPLOAD_DONE`
- `UPLOAD_ERROR` — `{ message: string }`
- `STATUS` — `{ compression: Compression }`
- `STREAM_ERROR`

The machine does not distinguish the two sources — same mailbox, same transition table.
That is why they share one union.

Promise actors need no events here: `invoke` generates `onDone`/`onError` on its own.

---

## States

```
idle
 └─ SUBMIT ─→ creating                     [stores file + preset]

creating                                   [invoke createCompressionLogic]
 ├─ onDone  ─→ uploading                   [stores compressionId + uploadUrl]
 └─ onError ─→ failed

uploading                                  [invoke uploadFileLogic]
 ├─ UPLOAD_PROGRESS   (internal, no target)
 ├─ UPLOAD_DONE  ─→ confirming
 ├─ UPLOAD_ERROR ─→ failed
 └─ CANCEL       ─→ idle                   ← the only state where CANCEL exists

confirming                                 [invoke confirmUploadLogic]
 ├─ onDone  ─→ compressing
 └─ onError ─→ failed

compressing                                [invoke streamStatusLogic]
 ├─ initial: queued
 ├─ queued      ─ STATUS(PROCESSING) ─→ processing
 ├─ processing  ─ STATUS(COMPLETED)  ─→ completed
 └─ STATUS(FAILED | EXPIRED) / STREAM_ERROR ─→ failed

completed
 ├─ DOWNLOAD ─→ [invoke getDownloadUrlLogic] → triggers browser download
 └─ RESET    ─→ idle

failed
 ├─ RETRY ─→ creating                      (reuses context.file)
 └─ RESET ─→ idle
```

**Why the SSE is invoked on the parent `compressing`, not on `queued`/`processing`:**
re-entering a *child* state does not restart the *parent's* actors. Putting it on the
children would tear down and reopen the EventSource on every status change.

**Why `creating` / `uploading` / `confirming` are three states:** the API models all
three as a single `PENDING_UPLOAD` row, but they are three distinct screens. Machine
states mirror the UI, not the database enum.

---

## Actors

Each actor wraps a function from `lib/api.ts`. No raw `fetch` lives in the machine.

| Actor | Kind | Wraps | Input |
|---|---|---|---|
| `createCompressionLogic` | `fromPromise` | `requestCompression` | `RequestCompressionInput` |
| `uploadFileLogic` | `fromCallback` | `uploadToS3` | `{ uploadUrl, file }` |
| `confirmUploadLogic` | `fromPromise` | `confirmUpload` | `ConfirmUploadInput` |
| `streamStatusLogic` | `fromCallback` | `streamCompression` | `StreamCompressionInput` |
| `getDownloadUrlLogic` | `fromPromise` | `requestDownload` | `RequestDownloadInput` |

Rule for choosing: **does it report back more than once?** Yes → `fromCallback`, which
talks through `sendBack`. No → `fromPromise`, which talks through `return` / `throw`.

Upload and SSE report many times (progress ticks, status changes), so they are callbacks.

### `uploadFileLogic` does not take `UploadS3Input`

`UploadS3Input` includes `onProgress` and `signal`. Neither comes from context — both are
created *inside* the actor. So the invoke passes only `{ uploadUrl, file }` and the actor
assembles the rest:

```ts
export const uploadFileLogic = fromCallback<Events, { uploadUrl: string; file: File }>(
    ({ sendBack, input }) => {
        const controller = new AbortController()

        uploadToS3({
            uploadUrl: input.uploadUrl,
            file: input.file,
            onProgress: (percent) => sendBack({ type: "UPLOAD_PROGRESS", percent }),
            signal: controller.signal,
        })
            .then(() => sendBack({ type: "UPLOAD_DONE" }))
            .catch((err: Error) => {
                if (controller.signal.aborted) return  // cancel is not an error
                sendBack({ type: "UPLOAD_ERROR", message: err.message })
            })

        return () => controller.abort()
    },
)
```

The `return` of a `fromCallback` is the **cleanup function**, not the result. Returning
the promise from `uploadToS3` is a type error and leaves the upload uncancellable.

The actor holds the `AbortController` (the button); `uploadToS3` receives only
`controller.signal` (the wire). Leaving `uploading` runs the cleanup, which aborts.

### `streamStatusLogic` must guard the terminal close

`EventSource` reconnects automatically when a connection drops, and it cannot tell a
normal server close from a network failure. The API closes the stream at
`COMPLETED`/`FAILED` — so without a guard it reconnects forever and every success is
followed by a spurious `STREAM_ERROR`.

```ts
export const streamStatusLogic = fromCallback<Events, StreamCompressionInput>(
    ({ sendBack, input }) => {
        const source = streamCompression(input)
        let done = false

        source.onmessage = (event) => {
            const compression: Compression = JSON.parse(event.data)
            if (compression.status === "COMPLETED" || compression.status === "FAILED") {
                done = true
            }
            sendBack({ type: "STATUS", compression })
        }

        source.onerror = () => {
            if (done) return
            sendBack({ type: "STREAM_ERROR" })
        }

        return () => source.close()
    },
)
```

Check the API's Swagger for whether it emits *named* SSE events. `onmessage` only
receives unnamed ones; named events need `addEventListener(name, ...)`.

---

## Actions

| Action | Where | Does |
|---|---|---|
| `storeFile` | `SUBMIT` transition | assigns `file` + `preset` |
| `storeCreateResult` | `onDone` of `creating` | assigns `compressionId` + `uploadUrl` |
| `trackProgress` | `UPLOAD_PROGRESS` (internal) | assigns `uploadedPercent` |
| `storeCompression` | `STATUS` | assigns `compression` |
| `storeError` | every error path | assigns `error` |
| `clearError` | `entry` of `creating` | covers arriving from both `idle` and `failed` |
| `resetProgress` | `entry` of `uploading` | zeroes `uploadedPercent` |
| `resetAll` | `entry` of `idle` | clears the whole context |
| `triggerDownload` | `onDone` of `getDownloadUrlLogic` | browser download effect |

### `assign` vs `machine.assign`

- **`machine.assign`** types `event` as the declared `Events` union. Fine when the action
  ignores the event (`entry: machine.assign({ uploadedPercent: 0 })`), and fine with
  `assertEvent` for the machine's own events.
- **The imported `assign`** picks up its type from position, so inside `onDone` it sees
  `DoneActorEvent` and `event.output` is typed.

`machine.assign` **cannot** be used in `onDone`/`onError` — the generated
`xstate.done.actor.*` event is not part of the declared union, so `event.output` does not
exist there and `assertEvent` has nothing to narrow to. Keep those inline.

### Internal transitions

`UPLOAD_PROGRESS` must have **no `target`**:

```ts
UPLOAD_PROGRESS: { actions: "trackProgress" }   // internal — actor survives
```

With a `target`, `uploading` exits and re-enters on every progress tick, killing and
restarting the upload roughly a hundred times per file.

---

## Guards

| Guard | Use |
|---|---|
| `withinSizeLimit` | 500 MB, per the design spec |
| `isSupportedType` | MP4 / WebM / MOV |
| `hasFile` | protects `RETRY` |

Form validation stays in react-hook-form (`../../validation.ts`). Guards are the second
line, protecting machine invariants.

---

## React wiring

```ts
const [snapshot, send] = useMachine(uploaderMachine)
```

The actor is created and started on **mount**, not on submit. Submit only sends an event:

```ts
methods.handleSubmit((data) => send({ type: "SUBMIT", file: data.file, preset: data.preset }))
```

- Render by `snapshot.matches("uploading")`.
- Read data from `snapshot.context`.
- Gate buttons with `snapshot.can({ type: "CANCEL" })` so the rule lives only in the machine.

A mount-time actor is what makes `idle`, `RESET` and `RETRY` possible — if the actor were
created on submit, those would have nowhere to live.

Toasts: prefer `emit({ type: "notify", ... })` from the machine and let the component call
`sonner`, keeping the machine testable without a DOM.

---

## Testing

Actors are registered as **strings** in `setup`, never inlined into `invoke`. That is what
makes them swappable:

```ts
const testMachine = uploaderMachine.provide({
    actors: {
        createCompressionLogic: fromPromise(async () => ({
            compressionId: "abc",
            uploadUrl: "https://s3.test/put",
            sourceKey: "k",
        })),
    },
})
```

Then `createActor(testMachine)`, send events, assert on `snapshot.value` — no network.

---

## Known gaps

Current state of this folder:

- [x] `machine.ts` — context/events typed, three actors registered
- [x] `actors.ts` — `createCompressionLogic`, `confirmUploadLogic`
- [ ] `actors.ts` — `uploadFileLogic` returns the promise instead of a cleanup function
- [ ] `actors.ts` — `streamStatusLogic`, `getDownloadUrlLogic` missing
- [ ] `states.ts` — `uploading` invoke input incomplete
- [ ] `states.ts` — `compressing`, `completed`, `failed` missing
- [ ] `states.ts` — inlines the `SUBMIT` assign instead of using `storeFile` from `actions.ts`
- [ ] `machine.ts` — `Context.file` typed `File` but should be `File | null`
- [ ] `machine.ts` — event typo: `DONWLOAD` should be `DOWNLOAD` (compiles, never fires)
- [ ] no `createMachine` call yet — states are not assembled into a machine

## Open risks

- **SSE drops.** `streamStatusLogic` has no reconnect/backoff and no polling fallback via
  `listCompressions()`. Do not assume the stream always delivers `COMPLETED`.
- **`EXPIRED`.** The API expires stalled uploads after 5 minutes and completed files after
  1 day. `STATUS` carrying `EXPIRED` needs its own copy, not a generic failure.
- **Sizes are strings.** `sourceSize`/`outputSize` are serialized BigInts. Convert before
  passing to `formatBytes` (`lib/format.ts`).
