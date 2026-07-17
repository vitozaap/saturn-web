import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UploadForm } from "@/components/upload/uploadForm";
export default function Home() {
  return (
    <div className="flex flex-col flex-1 h-full w-full items-center">
      <Header />
      <main className="flex flex-col items-center gap-6 justify-center max-w-2xl h-full">
        <section className="flex flex-col gap-4 items-center">
          <Badge variant={"secondary"} className="-rotate-2">Grátis · rápido · sem marca d&apos;água</Badge>
          <h1 className="font-heading font-extrabold tracking-tighter text-6xl max-w-md text-center">
            Dê um <span className="text-primary underline decoration-wavy decoration-4 decoration-coral">squish</span> nos seus vídeos.
          </h1>
          <p className="text-muted-foreground max-w-xl text-center text-lg">Comprima qualquer vídeo e baixe na hora! Sem perder a qualidade que realmente importa.</p>
        </section>
        <div className="flex flex-col gap-2 w-full min-h-1/2">
          <UploadForm />
        </div>
        <div className="flex">
          <p className="text-muted-foreground text-xs">Até 500MB - <Button variant={"link"} nativeButton={false} size={"xs"} className={"p-0"} render={<Link href="/login">Faça login</Link>} /> para mais funcionalidades.</p>
        </div>
      </main>
    </div>
  );
}
