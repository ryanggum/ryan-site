import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import PostShell from "../components/PostShell";
import start from "./../../assets/posts/start.jpg";

export default function Page() {
  const filePath = path.join(process.cwd(), "content/posts/oneself.md");
  const markdown = fs.readFileSync(filePath, "utf8");

  return (
    <PostShell title="#1: Writing about Oneself" image={start}>
      <div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </PostShell>
  );
}
