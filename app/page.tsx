"use client"
import Dropzone from "@/components/dropzone/dropzone";
import { compressionSchema, ICompressionForm } from "@/components/dropzone/validation";
import { Header } from "@/components/header";
import { Presets } from "@/components/preset/presets";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
export default function Home() {
  const methods = useForm<ICompressionForm>({
    resolver: zodResolver(compressionSchema),
    defaultValues: {
      preset: "MID",
    }
  })
  const onSubmit = (data: ICompressionForm) => {
    // TODO: Handle submit calling API POST /compressor
  }
  return (
    <div className="flex flex-col flex-1 h-full w-full items-center">
      <Header />

      <main className="flex flex-col items-center gap-6 justify-center max-w-2xl h-full">
        <section className="flex flex-col gap-4 items-center">
          <Badge variant={"secondary"} className="-rotate-2">Grátis · rápido · sem marca d'água</Badge>
          <h1 className="font-heading font-extrabold tracking-tighter text-6xl max-w-md text-center">
            Dê um <span className="text-primary underline decoration-wavy decoration-4 decoration-coral">squish</span> nos seus vídeos.
          </h1>
          <p className="text-muted-foreground max-w-xl text-center text-lg">Comprima qualquer vídeo e baixe na hora! Sem perder a qualidade que realmente importa.</p>
        </section>
        <div className="flex flex-col gap-2 w-full h-full">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-5 h-full ">
              <Dropzone className="h-5/12" />
              <Presets />
            </form>
          </FormProvider>
        </div>
      </main>
    </div>
  );
}
