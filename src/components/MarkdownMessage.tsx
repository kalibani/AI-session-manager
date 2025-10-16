"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useTheme } from "next-themes";

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  const { theme } = useTheme();
  const codeTheme = theme === "dark" ? oneDark : oneLight;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ ...props }) => (
          <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2 className="text-xl font-bold mt-3 mb-2" {...props} />
        ),
        h3: ({ ...props }) => (
          <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />
        ),

        // Paragraphs
        p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,

        // Lists
        ul: ({ ...props }) => (
          <ul
            className="list-disc list-outside ml-4 mb-2 space-y-1"
            {...props}
          />
        ),
        ol: ({ ...props }) => (
          <ol
            className="list-decimal list-outside ml-4 mb-2 space-y-1"
            {...props}
          />
        ),
        li: ({ ...props }) => <li className="ml-1" {...props} />,

        // Links
        a: ({ ...props }) => (
          <a
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // Inline code
        code: ({ className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          const isCodeBlock = language && String(children).includes("\n");

          return isCodeBlock ? (
            // Code block with syntax highlighting
            <div className="my-3 rounded-lg overflow-hidden">
              <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 text-xs text-gray-300 font-mono">
                {language}
              </div>
              <SyntaxHighlighter
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                style={codeTheme as any}
                language={language}
                PreTag="div"
                className="!mt-0 !rounded-t-none text-sm"
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            // Inline code
            <code
              className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400"
              {...props}
            >
              {children}
            </code>
          );
        },

        // Blockquotes
        blockquote: ({ ...props }) => (
          <blockquote
            className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2 text-gray-700 dark:text-gray-300"
            {...props}
          />
        ),

        // Horizontal rules
        hr: ({ ...props }) => (
          <hr
            className="my-4 border-gray-300 dark:border-gray-600"
            {...props}
          />
        ),

        // Tables
        table: ({ ...props }) => (
          <div className="overflow-x-auto my-3">
            <table
              className="min-w-full border border-gray-300 dark:border-gray-600"
              {...props}
            />
          </div>
        ),
        thead: ({ ...props }) => (
          <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
        ),
        th: ({ ...props }) => (
          <th
            className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold"
            {...props}
          />
        ),
        td: ({ ...props }) => (
          <td
            className="border border-gray-300 dark:border-gray-600 px-4 py-2"
            {...props}
          />
        ),

        // Strong and emphasis
        strong: ({ ...props }) => <strong className="font-bold" {...props} />,
        em: ({ ...props }) => <em className="italic" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
