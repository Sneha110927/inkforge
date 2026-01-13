declare module "archiver" {
  import { Transform } from "stream";

  interface ArchiverOptions {
    zlib?: { level?: number };
  }

  interface Archiver extends Transform {
    append(source: string | Buffer, options: { name: string }): this;
    finalize(): Promise<void>;
    pipe<T extends NodeJS.WritableStream>(destination: T): T;
  }

  function archiver(format: "zip" | "tar", options?: ArchiverOptions): Archiver;

  export default archiver;
}
