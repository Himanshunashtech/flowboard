import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { 
  Type, Bold as BoldIcon, Italic as ItalicIcon, MoreHorizontal, 
  List, ListOrdered, CheckSquare, Plus, 
  Download, 
  Type as HeadingIcon, Underline as UnderlineIcon, 
  Strikethrough, Code, Link as LinkIcon, Minus, Quote
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const [activeMenu, setActiveMenu] = useState(null); // 'headings', 'lists', 'insert', 'more', 'link'
  const [linkUrl, setLinkUrl] = useState('');

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const ToolbarButton = ({ onClick, isActive, icon: Icon, label, danger }) => (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-all flex items-center justify-center
        ${isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-tertiary hover:bg-bg-secondary hover:text-text-primary'}
        ${danger ? 'hover:text-danger hover:bg-danger/10' : ''}`}
      title={label}
    >
      <Icon size={18} />
    </button>
  );

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setActiveMenu(null);
    setLinkUrl('');
  };

  const handleDownload = () => {
    const content = editor.getText();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `description-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between p-1.5 border-b border-border-light bg-bg-secondary/30 backdrop-blur-sm rounded-t-2xl relative z-[100]">
      <div className="flex items-center gap-1">
        {/* Headings */}
        <div className="relative">
          <ToolbarButton 
            icon={Type} 
            label="Typography" 
            onClick={() => toggleMenu('headings')}
            isActive={editor.isActive('heading')}
          />
          {activeMenu === 'headings' && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-border-light rounded-xl shadow-xl z-50 p-1 w-32 animate-in fade-in slide-in-from-top-2">
              {[1, 2, 3].map(level => (
                <button
                  key={level}
                  onClick={() => { editor.chain().focus().toggleHeading({ level }).run(); setActiveMenu(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editor.isActive('heading', { level }) ? 'bg-brand-primary text-white' : 'hover:bg-bg-secondary text-text-primary'}`}
                >
                  Heading {level}
                </button>
              ))}
              <button
                onClick={() => { editor.chain().focus().setParagraph().run(); setActiveMenu(null); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editor.isActive('paragraph') ? 'bg-brand-primary text-white' : 'hover:bg-bg-secondary text-text-primary'}`}
              >
                Paragraph
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-border-light mx-1" />

        {/* Formatting */}
        <ToolbarButton 
          icon={BoldIcon} 
          label="Bold" 
          onClick={() => { editor.chain().focus().toggleBold().run(); setActiveMenu(null); }} 
          isActive={editor.isActive('bold')} 
        />
        <ToolbarButton 
          icon={ItalicIcon} 
          label="Italic" 
          onClick={() => { editor.chain().focus().toggleItalic().run(); setActiveMenu(null); }} 
          isActive={editor.isActive('italic')} 
        />
        
        {/* Link Modal */}
        <div className="relative">
          <ToolbarButton 
            icon={LinkIcon} 
            label="Insert Link" 
            onClick={() => {
              const previousUrl = editor.getAttributes('link').href;
              setLinkUrl(previousUrl || '');
              toggleMenu('link');
            }} 
            isActive={editor.isActive('link')} 
          />
          {activeMenu === 'link' && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-border-light rounded-xl shadow-xl z-50 p-3 w-64 animate-in zoom-in-95">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">Paste destination URL</p>
              <div className="flex gap-2">
                <input 
                  autoFocus
                  type="text" 
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-1.5 bg-bg-secondary border border-border-light rounded-lg text-xs font-bold outline-none focus:border-brand-primary"
                  onKeyDown={e => e.key === 'Enter' && setLink()}
                />
                <button onClick={setLink} className="px-3 py-1.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Apply</button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <ToolbarButton icon={MoreHorizontal} label="More Formatting" onClick={() => toggleMenu('more')} />
          {activeMenu === 'more' && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-border-light rounded-xl shadow-xl z-50 p-1 w-40">
              <button onClick={() => { editor.chain().focus().toggleUnderline().run(); setActiveMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-bg-secondary flex items-center gap-2 text-xs font-bold">
                <UnderlineIcon size={14} /> Underline
              </button>
              <button onClick={() => { editor.chain().focus().toggleStrike().run(); setActiveMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-bg-secondary flex items-center gap-2 text-xs font-bold">
                <Strikethrough size={14} /> Strikethrough
              </button>
              <button onClick={() => { editor.chain().focus().toggleCode().run(); setActiveMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-bg-secondary flex items-center gap-2 text-xs font-bold">
                <Code size={14} /> Inline Code
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-border-light mx-1" />

        {/* Lists */}
        <div className="relative">
          <ToolbarButton 
            icon={List} 
            label="Lists" 
            onClick={() => toggleMenu('lists')} 
            isActive={editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')}
          />
          {activeMenu === 'lists' && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-border-light rounded-xl shadow-xl z-50 p-1 w-40">
              <button onClick={() => { editor.chain().focus().toggleBulletList().run(); setActiveMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-bg-secondary flex items-center gap-2 text-xs font-bold">
                <List size={14} /> Bullet List
              </button>
              <button onClick={() => { editor.chain().focus().toggleOrderedList().run(); setActiveMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-bg-secondary flex items-center gap-2 text-xs font-bold">
                <ListOrdered size={14} /> Numbered List
              </button>
              <button onClick={() => { editor.chain().focus().toggleTaskList().run(); setActiveMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-bg-secondary flex items-center gap-2 text-xs font-bold">
                <CheckSquare size={14} /> Task List
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-border-light mx-1" />

        {/* Insert */}
        <div className="relative">
          <ToolbarButton icon={Plus} label="Insert" onClick={() => toggleMenu('insert')} />
          {activeMenu === 'insert' && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-border-light rounded-xl shadow-xl z-50 p-1 w-40">
              <button onClick={() => { editor.chain().focus().setHorizontalRule().run(); setActiveMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-bg-secondary flex items-center gap-2 text-xs font-bold">
                <Minus size={14} /> Divider
              </button>
              <button onClick={() => { editor.chain().focus().toggleBlockquote().run(); setActiveMenu(null); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-bg-secondary flex items-center gap-2 text-xs font-bold">
                <Quote size={14} /> Blockquote
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ToolbarButton icon={Download} label="Export as Markdown" onClick={handleDownload} />
      </div>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = 'Write something...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: true,
        orderedList: true,
      }),
      Underline,
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-primary underline cursor-pointer font-bold',
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getText());
    },
  });

  if (!editor) return null;

  return (
    <div className="rich-text-editor bg-white rounded-2xl border border-border-light shadow-sm focus-within:border-brand-primary/40 focus-within:ring-4 focus-within:ring-brand-primary/5 transition-all">
      <style>{`
        .rich-text-editor .ProseMirror h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5em; }
        .rich-text-editor .ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5em; }
        .rich-text-editor .ProseMirror h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5em; }
        .rich-text-editor .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; }
        .rich-text-editor .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; }
        .rich-text-editor .ProseMirror blockquote { border-left: 3px solid #6366f1; padding-left: 1em; color: #4b5563; font-style: italic; }
        .rich-text-editor .ProseMirror a { color: #6366f1; text-decoration: underline; font-weight: 700; }
      `}</style>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;

