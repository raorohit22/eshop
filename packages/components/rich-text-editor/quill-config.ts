/**
 * quill-config.ts
 * 
 * Provides configuration options for ReactQuill and handles the registration
 * of custom formatting attributors (fonts, sizes, alignment).
 * Keeping this separate ensures the main component remains focused on UI logic.
 */

export const modules = {
  toolbar: [
    [
      { font: ["sans-serif", "serif", "monospace", "inter", "roboto", "playfair-display", "poppins"] },
      { size: ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px", "64px"] },
    ],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    [{ align: [] }],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

export const formats = [
  "font",
  "size",
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "blockquote",
  "code-block",
  "list",
  "indent",
  "link",
  "image",
  "video",
  "align",
];

// Track whether Quill attributors have been registered (once globally)
let quillRegistered = false;

/**
 * Registers custom Quill attributors for fonts, sizes, and alignment using inline styles.
 * Must be called on the client side after Quill is imported.
 */
export function registerQuillModules() {
  if (quillRegistered) return;
  try {
    const QuillModule = require("react-quill-new");
    const Quill = QuillModule.Quill || QuillModule.default?.Quill;
    if (!Quill) return;

    // 1. Size attributor (using inline styles)
    const SizeStyle = Quill.import("attributors/style/size");
    SizeStyle.whitelist = [
      "10px", "12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px", "64px",
    ];
    Quill.register(SizeStyle, true);

    // 2. Font attributor (using inline styles)
    const FontStyle = Quill.import("attributors/style/font");
    FontStyle.whitelist = [
      "sans-serif", "serif", "monospace", "inter", "roboto", "playfair-display", "poppins",
    ];
    Quill.register(FontStyle, true);

    // 3. Align attributor (using inline styles)
    const AlignStyle = Quill.import("attributors/style/align");
    Quill.register(AlignStyle, true);

    quillRegistered = true;
  } catch (e) {
    console.warn("Failed to register Quill modules:", e);
  }
}
