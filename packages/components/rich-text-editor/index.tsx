"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import { modules, formats, registerQuillModules } from "./quill-config";
import { editorStyles } from "./quill-styles";

// Dynamically import ReactQuill to prevent SSR issues in Next.js
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-[150px] w-full bg-transparent border border-gray-700 rounded-md animate-pulse" />
  ),
});

interface RichTextEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  onchange?: (content: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * RichTextEditor Component
 * 
 * Provides a rich text editing interface using ReactQuill with dark mode support.
 * Follows SOLID principles by keeping configuration and styles in separate files.
 */
const RichTextEditor = ({
  value = "",
  onChange,
  onchange,
  placeholder = "Write description here...",
}: RichTextEditorProps) => {
  const [editorValue, setEditorValue] = useState(value);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  // Register Quill attributors after mount, then mark as ready
  useEffect(() => {
    registerQuillModules();
    setIsReady(true);
  }, []);

  // Sync external value updates
  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      setEditorValue(value);
    }
  }, [value]);

  // Clean up duplicate toolbars within this editor instance (caused by React Strict Mode)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanupToolbars = () => {
      const toolbars = container.querySelectorAll(".ql-toolbar");
      toolbars.forEach((toolbar, index) => {
        if (index > 0) {
          (toolbar as HTMLElement).remove();
        }
      });
    };

    cleanupToolbars();
    const timer = setTimeout(cleanupToolbars, 100);
    return () => clearTimeout(timer);
  }, [isReady]);

  // Inject custom styles once on mount to avoid re-parsing styles during keystrokes
  useEffect(() => {
    const styleId = "quill-dark-theme-overrides";
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      styleTag.innerHTML = editorStyles;
      document.head.appendChild(styleTag);
    }
  }, []);

  const handleChange = (content: string) => {
    lastValueRef.current = content;
    setEditorValue(content);
    if (onChange) {
      onChange(content);
    }
    if (onchange) {
      onchange(content);
    }
  };

  const wordCount = useMemo(() => {
    const text = editorValue
      .replace(/<[^>]*>/g, " ")  // strip HTML tags
      .replace(/&nbsp;/g, " ")   // replace &nbsp;
      .trim();
    if (!text) return 0;
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }, [editorValue]);

  if (!isReady) {
    return (
      <div className="h-[150px] w-full bg-transparent border border-gray-700 rounded-md animate-pulse" />
    );
  }

  return (
    <div
      ref={containerRef}
      className="rich-text-editor-container w-full relative"
    >
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <div className="flex justify-end px-3 py-1.5 border border-t-0 border-gray-700 rounded-b-md bg-[#111827]">
        <span className="text-xs text-gray-400">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;
