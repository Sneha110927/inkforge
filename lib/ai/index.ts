import { improveWriting } from "./actions/improveWriting";
import { summarize } from "./actions/summarize";
import { generateOutline } from "./actions/generateOutline";
import { convertDocs } from "./actions/convertDocs";
import { convertBlog} from "./actions/convertBlog";
import { insertMermaid } from "./actions/insertMermaid";

export type AIAction =
  | "improveWriting"
  | "summarize"
  | "generateOutline"
  | "convertDocs"
  | "convertBlog"
  | "insertMermaid";

export async function runAction(action: AIAction, markdown: string) {
  switch (action) {
    case "improveWriting":
      return improveWriting(markdown);

    case "summarize":
      return summarize(markdown);

    case "generateOutline":
      return generateOutline(markdown);

   case "convertDocs":
      return convertDocs(markdown);

    case "convertBlog":
      return convertBlog(markdown);


    case "insertMermaid":
      return insertMermaid(markdown);

    default:
      throw new Error("Unknown AI action");
  }
}
