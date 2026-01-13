import { NextResponse } from "next/server";
import archiver from "archiver";
import { exportStaticSite } from "@/lib/exporter";
import { PassThrough } from "stream";

export const runtime = "nodejs";

export async function GET() {
  const files = await exportStaticSite();

  const nodeStream = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(nodeStream);

  for (const f of files) {
    archive.append(f.content, { name: f.path });
  }

  await archive.finalize();

  // ✅ Convert Node stream → Web ReadableStream
  const webStream = new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on("data", (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      });

      nodeStream.on("end", () => {
        controller.close();
      });

      nodeStream.on("error", (err) => {
        controller.error(err);
      });
    },
  });

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="static-site.zip"',
    },
  });
}
