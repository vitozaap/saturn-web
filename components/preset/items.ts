

interface Preset {
    title: string
    selector: "HIGH" | "MID" | "LOW"
    description: string
    recommended?: boolean
}

export const items: Preset[] = [
    {
        title: "Máxima economia",
        description: "Encolhe ao máximo. Bom pra WhatsApp, prévias e rascunhos.",
        selector: "LOW"
    },
    {
        title: "Equilibrado",
        description: "Bem menor, sem perda visível. O ideal pra quase tudo.",
        selector: "MID",
        recommended: true
    },
    {
        title: "Máxima qualidade",
        description: "Prioriza cada detalhe. Pra apresentações e publicação.",
        selector: "HIGH",
    },

]