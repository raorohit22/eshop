const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8090;
const DOCS_DIR = path.join(__dirname, 'tech-docs');

app.use(cors());
app.use(express.json());

// Redirect root to /tech-docs
app.get('/', (req, res) => {
  res.redirect('/tech-docs');
});

// Serve the documentation viewer UI
app.get('/tech-docs', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Eshop Technical Documentation</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#f5f3ff',
              100: '#ede9fe',
              200: '#ddd6fe',
              300: '#c4b5fd',
              400: '#a78bfa',
              500: '#8b5cf6',
              600: '#7c3aed',
              700: '#6d28d9',
              800: '#5b21b6',
              900: '#4c1d95',
              950: '#2e1065',
            }
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Marked.js for Markdown parsing -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  
  <!-- PrismJS for Syntax Highlighting -->
  <link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
  
  <!-- Mermaid.js for Diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      logLevel: 5,
      flowchart: { useMaxWidth: false },
      sequence: { useMaxWidth: false }
    });
  </script>

  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    code {
      font-family: 'Fira Code', monospace !important;
    }
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0f172a;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }
    
    /* Markdown Styling overrides */
    .prose h1 {
      font-size: 2.25rem;
      font-weight: 800;
      margin-top: 2rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #334155;
      padding-bottom: 0.5rem;
      color: #f8fafc;
    }
    .prose h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      color: #f1f5f9;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 0.25rem;
    }
    .prose h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      color: #e2e8f0;
    }
    .prose p {
      margin-top: 0.5rem;
      margin-bottom: 1rem;
      line-height: 1.7;
      color: #cbd5e1;
    }
    .prose ul, .prose ol {
      margin-left: 1.5rem;
      margin-bottom: 1rem;
      list-style-type: disc;
    }
    .prose li {
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
      color: #cbd5e1;
    }
    .prose blockquote {
      border-left: 4px solid #8b5cf6;
      padding-left: 1rem;
      font-style: italic;
      color: #94a3b8;
      margin: 1rem 0;
      background: #1e1b4b33;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      border-radius: 0 4px 4px 0;
    }
    .prose table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.925rem;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #1e293b;
    }
    .prose th, .prose td {
      border: 1px solid #1e293b;
      padding: 0.85rem 1rem;
      text-align: left;
    }
    .prose th {
      background-color: #1e293b;
      color: #f8fafc;
      font-weight: 600;
      border-bottom: 2px solid #334155;
    }
    .prose tr:nth-child(even) {
      background-color: #0f172a55;
    }
    .prose tr:hover {
      background-color: #1e293b55;
    }
    .prose pre {
      background-color: #0f172a !important;
      border: 1px solid #1e293b;
      border-radius: 0.5rem;
      padding: 1.25rem;
      margin: 1.5rem 0;
      overflow-x: auto;
    }
    .prose code:not(pre code) {
      background-color: #1e293b;
      color: #f472b6;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.875em;
      font-weight: 500;
      border: 1px solid #33415555;
    }
    .prose input[type="checkbox"] {
      height: 1rem;
      width: 1rem;
      border-radius: 0.25rem;
      border: 1px solid #475569;
      background-color: #0f172a;
      color: #8b5cf6;
      accent-color: #8b5cf6;
      margin-right: 0.5rem;
      vertical-align: middle;
      cursor: not-allowed;
    }
    
    /* GitHub Alert Styling */
    .alert-note, .alert-tip, .alert-important, .alert-warning, .alert-caution {
      padding: 1rem;
      border-left: 4px solid;
      margin: 1.5rem 0;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    .alert-note { border-color: #3b82f6; background-color: #1e3a8a22; color: #93c5fd; }
    .alert-tip { border-color: #10b981; background-color: #064e3b22; color: #6ee7b7; }
    .alert-important { border-color: #8b5cf6; background-color: #4c1d9522; color: #c4b5fd; }
    .alert-warning { border-color: #f59e0b; background-color: #78350f22; color: #fde047; }
    .alert-caution { border-color: #ef4444; background-color: #7f1d1d22; color: #fca5a5; }

    /* Custom adjustments for Mermaid diagrams */
    .mermaid-svg-container {
      background: #0f172a;
      border: 1px solid #1e293b;
      padding: 2rem 1.5rem;
      border-radius: 0.75rem;
      margin: 1.5rem 0;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow-x: auto;
    }
    .mermaid-svg-container svg {
      width: 100% !important;
      max-width: 900px !important;
      height: auto !important;
      min-width: 650px;
    }
    @media (max-width: 768px) {
      .mermaid-svg-container svg {
        min-width: 100%;
      }
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

  <!-- Header -->
  <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 bg-brand-600 rounded-xl flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-brand-500/20">
          E
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-white">Eshop</h1>
          <p class="text-xs text-slate-400 font-medium">Technical Documentation Portal</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative w-64">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input type="text" id="search" placeholder="Search documentation..." class="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-brand-500 transition-colors">
        </div>
        <a href="https://github.com" target="_blank" class="text-slate-400 hover:text-white transition-colors">
          <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg>
        </a>
      </div>
    </div>
  </header>

  <!-- Content Container -->
  <div class="flex-1 flex max-w-[1600px] w-full mx-auto relative">
    
    <!-- Sidebar Navigation -->
    <aside class="w-80 border-r border-slate-800 bg-slate-950/50 p-6 hidden md:block sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
      <div class="space-y-6">
        <div>
          <h5 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Welcome</h5>
          <ul class="space-y-1">
            <li>
              <a href="#README.md" class="sidebar-link flex items-center px-3 py-2 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-all font-medium" data-file="README.md">
                🏠 Index / Overview
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h5 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Documentation Pages</h5>
          <ul id="sidebar-pages" class="space-y-1">
            <!-- Dynamic pages will load here -->
            <li class="px-3 py-2 text-sm text-slate-600 italic">Loading index...</li>
          </ul>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 px-6 md:px-12 py-10 overflow-x-hidden">
      <!-- Breadcrumbs -->
      <nav class="flex text-sm text-slate-400 mb-6 font-medium" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="inline-flex items-center">
            <span class="hover:text-white transition-colors cursor-pointer">Docs</span>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
              <span id="breadcrumb-active" class="ml-1 text-slate-200 md:ml-2">README.md</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Markdown Viewer Wrapper -->
      <article class="prose prose-invert max-w-4xl" id="content-viewer">
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-slate-800 rounded w-3/4"></div>
          <div class="h-4 bg-slate-800 rounded"></div>
          <div class="h-4 bg-slate-800 rounded w-5/6"></div>
          <div class="h-4 bg-slate-800 rounded w-1/2"></div>
        </div>
      </article>
    </main>

  </div>

  <!-- Footer -->
  <footer class="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600 font-medium">
    &copy; 2026 Eshop Engineering Team. All rights reserved.
  </footer>

  <script>
    let filesList = [];
    
    marked.setOptions({
      pedantic: false,
      gfm: true,
      breaks: true,
      sanitize: false,
      smartLists: true,
      smartypants: true,
      xhtml: false
    });

    // Helper to fetch file content and render
    async function loadFile(fileName) {
      const viewer = document.getElementById('content-viewer');
      viewer.innerHTML = \`<div class="animate-pulse space-y-4">
        <div class="h-8 bg-slate-800 rounded w-3/4"></div>
        <div class="h-4 bg-slate-800 rounded"></div>
        <div class="h-4 bg-slate-800 rounded w-5/6"></div>
      </div>\`;
      
      document.getElementById('breadcrumb-active').textContent = fileName;
      
      // Update active link styling
      document.querySelectorAll('.sidebar-link').forEach(link => {
        if (link.getAttribute('data-file') === fileName) {
          link.classList.add('bg-brand-900/40', 'text-brand-400', 'border-l-2', 'border-brand-500');
          link.classList.remove('text-slate-300', 'hover:bg-slate-900');
        } else {
          link.classList.remove('bg-brand-900/40', 'text-brand-400', 'border-l-2', 'border-brand-500');
          link.classList.add('text-slate-300', 'hover:bg-slate-900');
        }
      });

      try {
        const res = await fetch(\`/tech-docs/files/\${encodeURIComponent(fileName)}\`);
        if (!res.ok) throw new Error('File not found');
        const data = await res.json();
        
        // Parse markdown using marked (built-in HTML output)
        viewer.innerHTML = marked.parse(data.content);

        // 1. Post-process blockquotes for GitHub alerts (version-safe)
        viewer.querySelectorAll('blockquote').forEach(bq => {
          const html = bq.innerHTML;
          const text = bq.textContent || '';
          
          const matchNote = text.match(/\\[!NOTE\\]/i);
          const matchTip = text.match(/\\[!TIP\\]/i);
          const matchImp = text.match(/\\[!IMPORTANT\\]/i);
          const matchWarn = text.match(/\\[!WARNING\\]/i);
          const matchCaut = text.match(/\\[!CAUTION\\]/i);
          
          let alertClass = '';
          let title = 'NOTE';
          let cleanHtml = html;
          
          if (matchNote) {
            alertClass = 'alert-note';
            cleanHtml = cleanHtml.replace(/\\[!NOTE\\]/gi, '');
          } else if (matchTip) {
            alertClass = 'alert-tip';
            title = 'TIP';
            cleanHtml = cleanHtml.replace(/\\[!TIP\\]/gi, '');
          } else if (matchImp) {
            alertClass = 'alert-important';
            title = 'IMPORTANT';
            cleanHtml = cleanHtml.replace(/\\[!IMPORTANT\\]/gi, '');
          } else if (matchWarn) {
            alertClass = 'alert-warning';
            title = 'WARNING';
            cleanHtml = cleanHtml.replace(/\\[!WARNING\\]/gi, '');
          } else if (matchCaut) {
            alertClass = 'alert-caution';
            title = 'CAUTION';
            cleanHtml = cleanHtml.replace(/\\[!CAUTION\\]/gi, '');
          }
          
          if (alertClass) {
            const div = document.createElement('div');
            div.className = alertClass;
            div.innerHTML = \`
              <div class="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                \${title}
              </div>
              \${cleanHtml}
            \`;
            bq.parentNode.replaceChild(div, bq);
          }
        });

        // 2. Post-process code blocks for Mermaid diagrams
        viewer.querySelectorAll('code.language-mermaid').forEach(codeEl => {
          const pre = codeEl.parentElement;
          const codeText = codeEl.textContent;
          const div = document.createElement('div');
          div.className = 'mermaid-svg-container';
          div.innerHTML = \`<pre class="mermaid">\${codeText}</pre>\`;
          pre.parentNode.replaceChild(div, pre);
        });
        
        // Prism Highlight (excluding mermaid blocks)
        Prism.highlightAllUnder(viewer);
        
        // Render Mermaid Diagrams
        const mermaidElements = viewer.querySelectorAll('.mermaid');
        if (mermaidElements.length > 0) {
          mermaid.run({
            nodes: mermaidElements
          });
        }
        
        // Rewrite local MD file links to hashes for seamless SPA experience
        viewer.querySelectorAll('a').forEach(a => {
          const href = a.getAttribute('href');
          if (href && href.startsWith('./') && href.endsWith('.md')) {
            const fileName = href.replace('./', '');
            a.setAttribute('href', '#' + fileName);
          }
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } catch (err) {
        viewer.innerHTML = \`<div class="bg-red-950/20 border border-red-800/40 text-red-400 p-6 rounded-lg">
          <h3 class="text-lg font-bold mb-2">Error Loading Document</h3>
          <p>\${err.message}</p>
        </div>\`;
      }
    }

    // Load Sidebar
    async function init() {
      try {
        const res = await fetch('/tech-docs/files');
        const data = await res.json();
        filesList = data.files;
        
        const sidebarPages = document.getElementById('sidebar-pages');
        sidebarPages.innerHTML = '';
        
        // Filter out README.md for the main list, and sort numbered pages
        const pages = filesList
          .filter(f => f !== 'README.md')
          .sort();
          
        pages.forEach(file => {
          // Format display name: e.g. "01-ARCHITECTURE.md" -> "01 — Architecture"
          let displayName = file.replace('.md', '').replace('-', ' — ');
          displayName = displayName.split('_').join(' ');
          
          const li = document.createElement('li');
          li.innerHTML = \`
            <a href="#\${file}" class="sidebar-link flex items-center px-3 py-2 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-all font-medium" data-file="\${file}">
              \${displayName}
            </a>
          \`;
          sidebarPages.appendChild(li);
        });

        // Setup routing based on hash
        const handleHashChange = () => {
          const hash = window.location.hash.substring(1) || 'README.md';
          loadFile(hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Load initial page
        
        // Search filter
        document.getElementById('search').addEventListener('input', function(e) {
          const term = e.target.value.toLowerCase();
          document.querySelectorAll('.sidebar-link').forEach(link => {
            const text = link.textContent.toLowerCase();
            if (text.includes(term)) {
              link.parentElement.style.display = 'block';
            } else {
              link.parentElement.style.display = 'none';
            }
          });
        });

      } catch (err) {
        console.error('Failed to load documentation files list:', err);
      }
    }

    init();
  </script>
</body>
</html>`);
});

// Endpoint to list all markdown files in tech-docs directory
app.get('/tech-docs/files', (req, res) => {
  fs.readdir(DOCS_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read directory' });
    }
    const mdFiles = files.filter(file => file.endsWith('.md'));
    res.json({ files: mdFiles });
  });
});

// Endpoint to get content of a specific markdown file
app.get('/tech-docs/files/:name', (req, res) => {
  const fileName = req.params.name;
  
  // Basic security check to prevent directory traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return res.status(400).json({ error: 'Invalid file name' });
  }

  const filePath = path.join(DOCS_DIR, fileName);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ content: data });
  });
});

// Endpoint for gateway health-check compatibility
app.get('/tech-docs/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Start the documentation server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`📚 Eshop Documentation Live Server running!`);
  console.log(`🌐 URL: http://localhost:${PORT}/tech-docs`);
  console.log(`==================================================\n`);
});
