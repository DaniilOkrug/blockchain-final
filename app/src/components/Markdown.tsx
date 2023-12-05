import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGemoji from 'remark-gemoji'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import remarkCodeTitle from 'remark-code-title'
import rehypeHighlight from 'rehype-highlight'

type Props = {
  children: string
  className?: string
}

const Markdown: React.FC<Props> = ({children, className}) => {
  return (
    <ReactMarkdown
      className={className}
      remarkPlugins={[remarkGfm, remarkCodeTitle, remarkEmoji, remarkGemoji]}
      rehypePlugins={[rehypeHighlight]}
    >
      {children}
    </ReactMarkdown>
  )
}

export default Markdown
