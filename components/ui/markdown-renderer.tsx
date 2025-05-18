"use client"
import ReactMarkdown from "react-markdown"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div

      className={`markdown-content ${className}`}
    >
      <ReactMarkdown
        components={{
          // Customize how different elements are rendered
          p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 mt-5" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-3 mt-4" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-bold mb-2 mt-4" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
          ),
          code: ({ node, ...props }) =>
            // inline ? (
            //   <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm" {...props} />
            // ) : (
            <code className="block bg-gray-100 p-2 rounded font-mono text-sm overflow-x-auto my-4" {...props} />
          ,
          pre: ({ node, ...props }) => <pre className="bg-gray-100 p-4 rounded overflow-x-auto my-4" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto my-4 border-2 border-black" {...props} alt={props.alt || ""} />
          ),
          hr: ({ node, ...props }) => <hr className="my-6 border-t-2 border-gray-200" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
