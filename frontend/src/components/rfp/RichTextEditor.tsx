import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { RichTextEditorProps } from '../../types';

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing...',
  editorType = 'rfp',
}) => {
  const [value, setValue] = useState(content);

  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange(newValue);
  };

  // Quill modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link']
      ],
    },
  };

  // Quill formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  // Custom toolbar for floorplan editor
  const FloorplanToolbar = () => {
    if (editorType !== 'floorplan') return null;

    return (
      <div className="relative p-2 flex gap-2 bg-gray-50">
        <button 
          className="px-3 py-1 border rounded hover:bg-gray-100"
          onClick={() => handleChange(value + '<div class="table-element">Table</div>')}
        >
          Add Table
        </button>
        <button 
          className="px-3 py-1 border rounded hover:bg-gray-100"
          onClick={() => handleChange(value + '<div class="chair-element">Chair</div>')}
        >
          Add Chair
        </button>
        {/* Continuous horizontal line */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200"></div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <FloorplanToolbar />
      <div className="flex-1 overflow-auto">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default RichTextEditor; 