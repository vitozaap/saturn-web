import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Uploader } from "@/components/compress/upload/uploader/uploader";
export default function Home() {
  return (
    <div className="flex flex-col flex-1 h-full w-full items-center">
      <Header />
      <Uploader />
    </div>
  );
}
