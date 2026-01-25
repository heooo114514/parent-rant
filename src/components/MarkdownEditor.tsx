'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import { 
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, 
  Image as ImageIcon, Loader2, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, 
  Undo, Redo, Strikethrough, Highlighter, Palette
} from 'lucide-react'
import { useCallback, useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'

interface MarkdownEditorProps {
  content: string
  onChange?: (content: string) => void
  placeholder?: string
  onImageUpload?: (file: File) => Promise<string>
  className?: string
  minHeight?: string
}

export default function MarkdownEditor({ 
  content, 
  onChange, 
  placeholder, 
  onImageUpload,
  className,
  minHeight = "min-h-[300px]"
}: MarkdownEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const colors = ['#000000', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // 排除可能冲突的默认扩展
        // @ts-ignore
        link: false,
        // @ts-ignore
        underline: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || '写下你的想法...',
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline cursor-pointer',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ] as any[],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-slate max-w-none focus:outline-none px-6 py-4 ${minHeight} font-mono`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  // Sync content updates from parent (e.g. initial load or reset)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only update if content is significantly different to avoid cursor jumps
      // This is a simple check; for perfect sync, more complex logic is needed
      // But for "reset" scenarios (content becoming empty), this works.
      if (content === '') {
        editor.commands.setContent('')
      }
    }
  }, [content, editor])

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    if (!onImageUpload) {
      toast.error('暂不支持图片上传')
      return
    }

    try {
      setIsUploading(true)
      const url = await onImageUpload(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (error) {
      console.error(error)
      toast.error('图片插入失败')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [editor, onImageUpload])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) return

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ onClick, isActive = false, disabled = false, title, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 border-2 border-transparent hover:border-black transition-all ${
        isActive ? 'bg-[var(--primary-color)] text-black border-black shadow-[2px_2px_0_0_black]' : 'text-black hover:bg-white hover:shadow-[2px_2px_0_0_black]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={title}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-0.5 h-6 bg-black mx-1" />

  return (
    <div className={`border-2 border-black bg-white flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b-2 border-black bg-white p-2 flex-wrap sticky top-0 z-10">
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="撤销"
          >
            <Undo size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做"
          >
            <Redo size={18} />
          </ToolbarButton>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <div className="relative">
            <ToolbarButton
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              isActive={isColorPickerOpen}
              title="文字颜色"
            >
              <Palette size={18} style={{ color: editor.getAttributes('textStyle').color || 'black' }} />
            </ToolbarButton>
            {isColorPickerOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsColorPickerOpen(false)} />
                <div className="absolute top-full left-0 mt-2 p-2 bg-white border-2 border-black shadow-[4px_4px_0_0_black] z-30 flex gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        ;(editor.chain().focus() as any).setColor(color).run()
                        setIsColorPickerOpen(false)
                      }}
                      className="w-6 h-6 border-2 border-black hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <ToolbarButton
            onClick={() => (editor.chain().focus() as any).toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="高亮"
          >
            <Highlighter size={18} />
          </ToolbarButton>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="一级标题"
          >
            <Heading1 size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="二级标题"
          >
            <Heading2 size={18} />
          </ToolbarButton>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="加粗"
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="斜体"
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => (editor.chain().focus() as any).toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="下划线"
          >
            <UnderlineIcon size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="删除线"
          >
            <Strikethrough size={18} />
          </ToolbarButton>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => (editor.chain().focus() as any).setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="左对齐"
          >
            <AlignLeft size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => (editor.chain().focus() as any).setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="居中"
          >
            <AlignCenter size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => (editor.chain().focus() as any).setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="右对齐"
          >
            <AlignRight size={18} />
          </ToolbarButton>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="无序列表"
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="有序列表"
          >
            <ListOrdered size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="引用"
          >
            <Quote size={18} />
          </ToolbarButton>
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="插入链接"
          >
            <LinkIcon size={18} />
          </ToolbarButton>
          
          {onImageUpload && (
            <>
              <ToolbarButton
                onClick={handleImageClick}
                disabled={isUploading}
                title="插入图片"
              >
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
              </ToolbarButton>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 bg-white cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
