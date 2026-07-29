import type { Metadata } from "next"
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

import { MarketingPage } from "@/components/marketing/marketingPage"
import { StepCard } from "@/components/marketing/stepCard"
import { Float } from "@/components/motion/ambient"
import { Logo } from "@/components/logo"

export const metadata: Metadata = {
    title: "Como funciona — Squish",
    description:
        "Três passos para comprimir seu vídeo: solte o arquivo, a gente espreme na nuvem e você baixa na hora.",
}

export default function Help() {
    return (
        <MarketingPage
            badge="Simples assim"
            badgeClassName="-rotate-2"
            title="Três passos. Zero complicação."
            lead={
                <>
                    Sem instalar nada, sem criar conta, sem ler manual.
                    <span className="hidden md:inline">
                        {" "}
                        É só soltar o vídeo e deixar a gente espremer.
                    </span>
                </>
            }
            bullets={[
                { label: "Grátis, de verdade", tone: "primary" },
                { label: "Sem marca d'água", tone: "coral" },
                { label: "Excluído do servidor em 24h", tone: "gold" },
            ]}
            secondary={{ href: "/formats", label: "ver formatos suportados" }}
            decor={
                <>
                    <Float className="top-1/4 left-[8%] hidden size-3 rounded-full bg-primary/20 md:block" />
                    <Float
                        className="top-3/5 right-[7%] hidden font-mono text-sm font-bold text-primary/30 md:block"
                        delay={0.4}
                    >
                        −82%
                    </Float>
                </>
            }
        >
            <StepCard step="01" title="Solte o vídeo" icon={<ArrowUpFromLine className="size-5" />}>
                Arraste pra página ou escolha um arquivo. MP4, WebM e MOV — até 500 MB.
            </StepCard>
            <StepCard
                step="02"
                title="A gente espreme"
                featured
                icon={<Logo className="size-5" height={20} width={20} />}
            >
                Compressão na nuvem que tira o peso desnecessário e mantém a nitidez que importa.
            </StepCard>
            <StepCard step="03" title="Baixe na hora" icon={<ArrowDownToLine className="size-5" />}>
                Seu vídeo leve fica pronto em segundos e disponível pra baixar por 24 horas.
            </StepCard>
        </MarketingPage>
    )
}
