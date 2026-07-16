import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Header />
      <div className="h-(--top-spacing) shrink-0" />
      <main className="flex flex-col items-center justify-center">
        <section className="flex flex-col gap-6 items-center">
          <Badge variant={"secondary"} className="-rotate-2">Grátis · rápido · sem marca d'água</Badge>
          <h1 className="font-heading font-extrabold tracking-tighter text-6xl max-w-md text-center">
            Dê um <span className="text-primary underline decoration-wavy decoration-4 decoration-coral">squish</span> nos seus vídeos.
          </h1>
          <p className="text-muted-foreground max-w-xl text-center text-lg">Comprima qualquer vídeo e baixe na hora! Sem perder a qualidade que realmente importa.</p>
        </section>
      </main>
    </div>
  );
}
