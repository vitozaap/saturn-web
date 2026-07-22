import { confirmUpload, requestCompression, requestDownload, streamCompression, uploadToS3 } from "@/lib/api";
import { RequestCompressionInput, ConfirmUploadInput, UploadS3Input, StreamCompressionInput, Compression, RequestDownloadInput } from "@/lib/types";
import { fromCallback, fromPromise } from "xstate";
import { Events } from "./types";



export const createCompressionLogic = fromPromise(async ({ input }: { input: RequestCompressionInput }) => await requestCompression(input))

export const downloadLogic = fromPromise(async ({ input }: { input: RequestDownloadInput }) => await requestDownload(input))

export const confirmUploadLogic = fromPromise(async ({ input }: { input: ConfirmUploadInput }) => await confirmUpload(input))

export const uploadFileLogic = fromCallback(
    ({ sendBack, input }: { sendBack: (event: Events) => void, input: Pick<UploadS3Input, "file" | "uploadUrl"> }) => {
        const controller = new AbortController()
        uploadToS3({
            uploadUrl: input.uploadUrl,
            file: input.file,
            signal: controller.signal,
            onProgress: (percent) => sendBack({ type: "UPLOAD_PROGRESS", percent })
        }).then(() => sendBack({ type: "UPLOAD_DONE" })).catch((err: Error) => {
            if (controller.signal.aborted) return
            sendBack({ type: "UPLOAD_ERROR", message: err.message })
        })
        return () => controller.abort()
    })


export const streamCompressionLogic = fromCallback(({ sendBack, input }: { sendBack: (event: Events) => void, input: StreamCompressionInput }) => {
    const stream = streamCompression(input)
    let done = false
    stream.onmessage = (ev) => {
        const comp: Compression = JSON.parse(ev.data)
        if (comp.status === "COMPLETED" || comp.status === "FAILED") done = true
        sendBack({ type: "STATUS", compression: comp })

    }

    stream.onerror = () => {
        if (done) return
        sendBack({ type: "STREAM_ERROR" })
    }

    return () => stream.close()
})


