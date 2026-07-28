"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { deleteCompressionAction } from "@/app/history/actions"
import { requestDownload } from "@/lib/api"
import { truncateFilename } from "@/lib/format"
import { Compression } from "@/lib/types"

export function useCompressionActions(comp: Compression) {
    const [isDeleting, startTransition] = useTransition()

    async function download() {
        try {
            const url = await requestDownload({ compressionId: comp.id })
            const anchor = document.createElement("a")
            anchor.href = url
            anchor.download = comp.filename
            anchor.click()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Falha ao baixar o arquivo.")
        }
    }

    async function copyLink() {
        try {
            const url = await requestDownload({ compressionId: comp.id })
            await navigator.clipboard.writeText(url)
            toast.success("Link copiado para a área de transferência.")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Falha ao copiar o link.")
        }
    }

    function remove() {
        startTransition(async () => {
            const { error } = await deleteCompressionAction(comp.id)
            if (error) toast.error(error)
            else toast.success(`${truncateFilename(comp.filename)} foi deletado com sucesso!`)
        })
    }

    return { download, copyLink, remove, isDeleting }
}

export type CompressionActions = ReturnType<typeof useCompressionActions>
