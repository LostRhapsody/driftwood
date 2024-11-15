import { MDXEditor } from '@mdxeditor/editor'
import { useRef } from 'react'
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  imagePlugin,
  tablePlugin,
  frontmatterPlugin,
  toolbarPlugin,
  diffSourcePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles
} from '@mdxeditor/editor'

import '@mdxeditor/editor/style.css'

const toolbar = [
  ['heading', 'bold', 'italic', 'quote'],
  ['unorderedList', 'orderedList'],
  ['link', 'image'],
  ['code', 'codeBlock', 'table'],
  ['thematicBreak']
]

const EditorComponent = ({
  markdown = '',
  onChange = () => {},
  className = ''
}) => {
  const editorRef = useRef(null)

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <MDXEditor
        ref={editorRef}
        markdown={markdown}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          linkPlugin(),
          imagePlugin(),
          tablePlugin(),
          frontmatterPlugin(),
          toolbarPlugin({
            toolbarClassName: 'my-classname',
            toolbarContents: () => (
              <>
                {' '}
                <UndoRedo />
                <BoldItalicUnderlineToggles />
              </>
          )}),
          diffSourcePlugin()
        ]}
        contentEditableClassName="min-h-[200px] p-4 prose prose-invert max-w-none"
      />
    </div>
  )
}

export default EditorComponent