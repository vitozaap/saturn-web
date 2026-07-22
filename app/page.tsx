import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Uploader } from "@/components/compress/upload/uploader/uploader";
export default function Home() {
  return (
    <div className="flex flex-1 flex-col min-h-0 w-full items-center">
      <Uploader />
    </div>
  );
}
