"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "~/lib/utils";

interface MentionRendererProps {
  content: string;
  className?: string;
}

export function MentionRenderer({ content, className }: MentionRendererProps) {
  // Function to parse and render mentions
  const renderContentWithMentions = (text: string) => {
    // Regex to match @mentions (@ followed by non-whitespace characters)
    const mentionRegex = /@(\S+)/g;
    
    const parts = text.split(mentionRegex);
    const result: React.ReactNode[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text part
        const textPart = parts[i];
        if (textPart) {
          result.push(textPart);
        }
      } else {
        // Mention part (captured group)
        const username = parts[i];
        if (username) {
          result.push(
            <span
              key={`mention-${i}`}
              className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"
              onClick={() => {
                // Optional: Navigate to user profile or show user info
                console.log(`Clicked mention: @${username}`);
              }}
              title={`Mentioned user: ${username}`}
            >
              @{username}
            </span>
          );
        }
      }
    }
    
    return result;
  };

  // Check if content contains mentions
  const hasMentions = /@\S+/.test(content);

  if (!hasMentions) {
    // If no mentions, render with ReactMarkdown as usual
    return (
      <div className={cn("prose prose-sm dark:prose-invert max-w-none text-sm", className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Split content by newlines to handle mentions per line
  const lines = content.split('\n');
  
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none text-sm", className)}>
      {lines.map((line, lineIndex) => {
        // Check if this line has markdown syntax (basic check)
        const hasMarkdown = /[*_`#\[\]!]/.test(line) && !/@\S+/.test(line);
        
        if (hasMarkdown) {
          // Render markdown for this line
          return (
            <ReactMarkdown
              key={lineIndex}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {line}
            </ReactMarkdown>
          );
        } else {
          // Render with mention parsing
          return (
            <p key={lineIndex} className="mb-2 last:mb-0">
              {renderContentWithMentions(line)}
            </p>
          );
        }
      })}
    </div>
  );
} 