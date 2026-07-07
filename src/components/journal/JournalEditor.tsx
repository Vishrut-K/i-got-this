"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect, useMemo, useRef } from 'react'
import { saveJournalEntry } from '@/server/actions'

export default function JournalEditor({ initialContent, date }: { initialContent: string, date: string }) {
  const [status, setStatus] = useState<"saved" | "saving" | "error">("saved");
  
  // Rotating prompts
  const prompts = useMemo(() => [
    "What happened today?",
    "What's on your mind?",
    "One sentence is enough.",
    "What did you learn today?",
    "How are you feeling right now?"
  ], []);
  
  const prompt = useMemo(() => {
    const daySeed = parseInt(date.replace(/-/g, '')) % prompts.length;
    return prompts[daySeed] || prompts[0];
  }, [date, prompts]);

  // Keep track of the latest content for saving
  const contentRef = useRef(initialContent);
  const [lastSavedTime, setLastSavedTime] = useState<string>("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: prompt,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-stone dark:prose-invert prose-lg max-w-none focus:outline-none min-h-[150px] leading-[1.7] text-[#2f2a25] dark:text-stone-300 [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4',
      },
    },
    onUpdate: ({ editor }) => {
      contentRef.current = editor.getHTML();
      setStatus("saving");
    },
  });

  // Debounced auto-save effect
  useEffect(() => {
    if (status !== "saving") return;

    const timeoutId = setTimeout(async () => {
      try {
        await saveJournalEntry(date, contentRef.current, []);
        setStatus("saved");
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        console.error("Failed to save journal", e);
        setStatus("error"); // Prevent infinite loop by not setting back to "saving"
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [status, date]);

  // Update content when date changes
  useEffect(() => {
    if (editor && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
      contentRef.current = initialContent;
      setStatus("saved");
    }
  }, [date, initialContent, editor]);

  if (!editor) return null;

  return (
    <div className="relative flex-1 flex flex-col mt-2">
      <div className="flex justify-end text-[10px] font-medium text-stone-400 dark:text-stone-500 transition-opacity items-center gap-1.5 mb-4 h-3">
        {status === "saving" ? (
          "Saving..."
        ) : status === "error" ? (
          <span className="text-red-500 font-bold">Failed to save</span>
        ) : (
          <>
            <span className="text-emerald-600 dark:text-emerald-500 font-bold">✓ Saved</span>
            {lastSavedTime && <span className="opacity-60">Last saved {lastSavedTime}</span>}
          </>
        )}
      </div>
      
      <div className="font-serif">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
