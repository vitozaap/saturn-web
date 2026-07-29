import type { Metadata } from "next"

import { FormatCard } from "@/components/marketing/formatCard"
import { MarketingPage } from "@/components/marketing/marketingPage"
import { Float } from "@/components/motion/ambient"

export const metadata: Metadata = {
    title: "Formatos — Squish",
    description:
        "MP4, WebM e MOV até 500 MB. A saída vem no mesmo formato do arquivo enviado, só bem mais leve.",
}

export default function Formats() {
    return (
        <MarketingPage
            badge="Entra pesado, sai leve"
            badgeClassName="rotate-2"
            title="O que entra no squish."
            lead={
                <>
                    <span className="hidden md:inline">
                        Esses são os formatos que a gente espreme hoje.{" "}
                    </span>
                    A saída vem no mesmo formato — só que bem mais leve.
                </>
            }
            bullets={[
                { label: "Até 500 MB por vídeo", tone: "primary" },
                { label: "Saída no mesmo formato", tone: "coral" },
                { label: "Qualidade preservada", tone: "gold" },
            ]}
            bulletsClassName="flex-row flex-wrap justify-center gap-3.5"
            secondary={{ href: "/help", label: "como funciona?" }}
            footnote={
                <>
                    <span>MKV, AVI e outros costumam funcionar também.</span>
                    <span>sentiu falta de um formato? conta pra gente :)</span>
                </>
            }
            decor={
                <>
                    <Float className="top-3/10 right-[10%] hidden size-3 rounded-full bg-primary/20 md:block" />
                    <Float
                        className="bottom-1/4 left-[9%] hidden font-mono text-base font-bold text-primary/25 md:block"
                        delay={0.8}
                    >
                        +
                    </Float>
                </>
            }
        >
            <FormatCard extension=".MP4" reduction="até −83%" title="O queridinho universal">
                Roda em todo lugar: celular, web, WhatsApp, TV. Se está em dúvida, é ele.
            </FormatCard>
            <FormatCard
                extension=".WEBM"
                reduction="até −86%"
                highlight
                title="Feito pra web"
                className="-rotate-1"
            >
                Ideal pra sites e vídeos embutidos. É o que mais encolhe no geral.
            </FormatCard>
            <FormatCard extension=".MOV" reduction="até −83%" title="Direto do iPhone e do Mac">
                O formato das gravações da Apple costuma ser gigante.
            </FormatCard>
        </MarketingPage>
    )
}
