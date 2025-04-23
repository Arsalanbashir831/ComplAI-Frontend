'use client';

import { useEffect } from 'react';
// import { Import } from "@tiptap-pro/extension-import";

import { FontSizeExtension } from '@/extensions/font-size';
import { LineHeightExtension } from '@/extensions/line-height';
import { useEditorStore } from '@/store/use-editor-store';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageResize from 'tiptap-extension-resize-image';

export const Editor = ({ initialContent }: { initialContent: string }) => {
  const { setEditor } = useEditorStore();

  const editor = useEditor({
    content: initialContent,
    extensions: [
      StarterKit,
      LineHeightExtension,
      FontSizeExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily,
      TextStyle,
      Underline,
      Image,
      ImageResize,
      Table,
      TableCell,
      TableHeader,
      TableRow,
      TaskItem.configure({
        nested: true,
      }),
      // Import.configure({
      //   appId: "your-app-id",
      //   token: "your-token",
      // }),
      TaskList,
    ],
    editorProps: {
      attributes: {
        style: 'padding-left: 40px; padding-right: 40px;',
        class:
          'focus:outline-none print:border-0 bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] pt-10 pr-10 cursor-text w-[49vw]',
      },
    },
    immediatelyRender: false,
    onCreate({ editor }) {
      setEditor(editor);
    },
    onDestroy() {
      setEditor(null);
    },
    onUpdate({ editor }) {
      setEditor(editor);
    },
    onSelectionUpdate({ editor }) {
      setEditor(editor);
    },
    onTransaction({ editor }) {
      setEditor(editor);
    },
    onFocus({ editor }) {
      setEditor(editor);
    },
    onBlur({ editor }) {
      setEditor(editor);
    },
    onContentError({ editor }) {
      setEditor(editor);
    },
  });

  useEffect(() => {
    if (editor) editor.commands.setContent(initialContent);
  }, [editor, initialContent]);

  return (
    <div className="size-full overflow-x-auto bg-[#F9FBFD] print:p-0 print:bg-white print:overflow-visible">
      <div className="flex justify-center py-4 print:py-0 mx-auto print:w-full print:min-w-0 w-full">
        {editor && <EditorContent editor={editor} />}
      </div>
    </div>
  );
};
