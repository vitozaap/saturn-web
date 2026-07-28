"use client"

import { CopyIcon, DownloadIcon, MoreHorizontalIcon, Trash } from "lucide-react"

import { Compression } from "@/lib/types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { CompressionActions } from "./useCompressionActions"

type RowActionsProps = {
    comp: Compression
    actions: CompressionActions
    showDownload?: boolean
}

export function RowActions({ comp, actions, showDownload = true }: RowActionsProps) {
    const downloadable = comp.status === "COMPLETED"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button size="icon-sm" variant="ghost" aria-label="Ações" />}
            >
                <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {showDownload && (
                    <DropdownMenuItem disabled={!downloadable} onClick={() => actions.download()}>
                        <DownloadIcon />
                        Baixar
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem disabled={!downloadable} onClick={() => actions.copyLink()}>
                    <CopyIcon />
                    Copiar link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    disabled={
                        comp.status === "PROCESSING" ||
                        comp.status === "QUEUED" ||
                        actions.isDeleting
                    }
                    render={<AlertDialog>
                        <AlertDialogTrigger render={
                            <Button variant={"destructive"} className={"w-full justify-start"}><Trash />
                                Apagar</Button>
                        } />
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja apagar <b>{comp.filename}</b>? Esta ação não pode ser revertida.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => actions.remove()}>Apagar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
