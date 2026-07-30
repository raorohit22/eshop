/**
 * quill-styles.ts
 * 
 * Contains the custom CSS overrides for ReactQuill.
 * By keeping this large string outside the component file, we satisfy the
 * maximum file size constraints and keep the component logic readable.
 */

export const editorStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');

  /* Dark theme overrides for Quill */
  .rich-text-editor-container .ql-toolbar.ql-snow {
    border: 1px solid #374151 !important;
    border-bottom: none !important;
    background-color: #111827 !important;
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px !important;
  }
  .rich-text-editor-container .ql-toolbar.ql-snow .ql-stroke {
    stroke: #d1d5db !important;
  }
  .rich-text-editor-container .ql-toolbar.ql-snow .ql-fill {
    fill: #d1d5db !important;
  }
  .rich-text-editor-container .ql-toolbar.ql-snow .ql-picker {
    color: #d1d5db !important;
  }
  .rich-text-editor-container .ql-toolbar.ql-snow .ql-picker-options {
    background-color: #1f2937 !important;
    border-color: #374151 !important;
    border-radius: 0.375rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  }
  .rich-text-editor-container .ql-container.ql-snow {
    border: 1px solid #374151 !important;
    background-color: transparent !important;
    border-bottom-left-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
    min-height: 200px;
    font-family: 'Inter', sans-serif;
  }
  .rich-text-editor-container .ql-editor {
    color: #f3f4f6 !important;
    min-height: 200px;
    font-size: 0.875rem;
    line-height: 1.6;
  }
  .rich-text-editor-container .ql-editor.ql-blank::before {
    color: #9ca3af !important;
    font-style: normal;
  }
  
  /* Font Selector Styling */
  .rich-text-editor-container .ql-snow .ql-picker.ql-font {
    width: 110px !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-label::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-item::before {
    content: 'Sans Serif' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
    content: 'Serif' !important;
    font-family: Georgia, serif !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
    content: 'Monospace' !important;
    font-family: monospace !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="inter"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="inter"]::before {
    content: 'Inter' !important;
    font-family: 'Inter', sans-serif !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="roboto"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="roboto"]::before {
    content: 'Roboto' !important;
    font-family: 'Roboto', sans-serif !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="playfair-display"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="playfair-display"]::before {
    content: 'Playfair' !important;
    font-family: 'Playfair Display', serif !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="poppins"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="poppins"]::before {
    content: 'Poppins' !important;
    font-family: 'Poppins', sans-serif !important;
  }

  /* Mapping inline style fonts within editor */
  .rich-text-editor-container .ql-editor [style*="font-family: inter"] {
    font-family: 'Inter', sans-serif !important;
  }
  .rich-text-editor-container .ql-editor [style*="font-family: roboto"] {
    font-family: 'Roboto', sans-serif !important;
  }
  .rich-text-editor-container .ql-editor [style*="font-family: playfair-display"] {
    font-family: 'Playfair Display', serif !important;
  }
  .rich-text-editor-container .ql-editor [style*="font-family: poppins"] {
    font-family: 'Poppins', sans-serif !important;
  }

  /* Size Selector Styling */
  .rich-text-editor-container .ql-snow .ql-picker.ql-size {
    width: 80px !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item::before {
    content: '16px' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="10px"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="10px"]::before {
    content: '10px' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="12px"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="12px"]::before {
    content: '12px' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="14px"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="14px"]::before {
    content: '14px' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="16px"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before {
    content: '16px' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="18px"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="18px"]::before {
    content: '18px' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="20px"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="20px"]::before {
    content: '20px' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="24px"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before {
    content: '24px' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="32px"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="32px"]::before {
    content: '32px' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="48px"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="48px"]::before {
    content: '48px' !important;
  }
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="64px"]::before,
  .rich-text-editor-container .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="64px"]::before {
    content: '64px' !important;
  }

  /* Color Picker Styling */
  .rich-text-editor-container .ql-snow .ql-picker.ql-color-picker .ql-picker-options {
    background-color: #1f2937 !important;
    border-color: #374151 !important;
    padding: 8px !important;
    border-radius: 0.375rem;
    width: 152px !important;
  }

  /* Blockquote Styling */
  .rich-text-editor-container .ql-editor blockquote {
    border-left: 4px solid #14b8a6 !important; /* teal accent */
    background-color: #1f2937 !important;
    padding: 8px 16px !important;
    margin: 8px 0 !important;
    color: #d1d5db !important;
    border-radius: 0.25rem;
    font-style: italic;
  }

  /* Code Block Styling */
  .rich-text-editor-container .ql-editor pre.ql-syntax {
    background-color: #111827 !important;
    color: #34d399 !important; /* emerald/green text for code */
    border: 1px solid #374151 !important;
    border-radius: 0.375rem;
    padding: 12px 16px !important;
    font-family: ui-monospace, SFMono-Regular, Menlow, Monaco, Consolas, monospace !important;
    font-size: 0.875rem !important;
    line-height: 1.5;
    overflow-x: auto;
    margin: 8px 0 !important;
  }
`;
