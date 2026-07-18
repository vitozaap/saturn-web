import { confirmUpload, requestCompression, uploadToS3 } from "@/lib/api";
import { RequestCompressionInput, ConfirmUploadInput, UploadS3Input } from "@/lib/types";
import { EventObject, fromCallback, fromPromise } from "xstate";
import { Events } from "./types";



export const createCompressionLogic = fromPromise(async ({ input }: { input: RequestCompressionInput }) => await requestCompression(input))
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


