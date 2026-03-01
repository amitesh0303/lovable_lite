'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Github, RefreshCw, Monitor, Tablet, Smartphone,
  Send, ChevronRight, ChevronDown, FileCode, Folder, Wand2, Loader2
} from 'lucide-react';
import { Project, ProjectFile, ChatMessage } from '@/types';
import { getLanguageFromPath } from '@/lib/utils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}

function buildFileTree(files: ProjectFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const map: Record<string, FileTreeNode> = {};

  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  sorted.forEach((file) => {
    const parts = file.path.split('/');
    let currentPath = '';

    parts.forEach((part, idx) => {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!map[currentPath]) {
        const node: FileTreeNode = {
          name: part,
          path: currentPath,
          type: idx === parts.length - 1 ? 'file' : 'folder',
          children: idx < parts.length - 1 ? [] : undefined,
        };
        map[currentPath] = node;

        if (!parentPath) {
          root.push(node);
        } else if (map[parentPath]?.children) {
          map[parentPath].children!.push(node);
        }
      }
    });
  });

  return root;
}

function FileTreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: FileTreeNode;
  depth: number;
  selectedPath: string;
  onSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = node.path === selectedPath;

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-gray-100 rounded text-sm text-gray-700"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Folder size={14} className="text-yellow-500 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
        {expanded && node.children?.map((child) => (
          <FileTreeItem key={child.path} node={child} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={`flex items-center gap-1.5 w-full px-2 py-1 rounded text-sm truncate ${
        isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
      }`}
      style={{ paddingLeft: `${depth * 16 + 22}px` }}
    >
      <FileCode size={14} className="shrink-0 text-gray-400" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

function ProjectEditorContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'chat'>('chat');
  const [deviceSize, setDeviceSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [githubForm, setGithubForm] = useState({ token: '', owner: '', repoName: '' });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportUrl, setExportUrl] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);

  const initialPrompt = searchParams.get('prompt');

  useEffect(() => {
    fetchProject();
    fetchFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (initialPrompt && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      handleGenerate(initialPrompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  async function fetchProject() {
    const res = await fetch(`/api/projects/${params.id}`);
    if (res.ok) setProject(await res.json());
  }

  async function fetchFiles() {
    const res = await fetch(`/api/projects/${params.id}/files`);
    if (res.ok) {
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setSelectedFile(data[0].path);
      }
    }
  }

  async function handleGenerate(prompt: string) {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectId: params.id }),
      });
      if (res.ok) {
        await fetchFiles();
        setGeneratePrompt('');
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), project_id: params.id, role: 'assistant', content: `✨ Generated app from prompt: "${prompt}"`, created_at: new Date().toISOString() },
        ]);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), project_id: params.id, role: 'user', content: msg, created_at: new Date().toISOString() },
    ]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, projectId: params.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), project_id: params.id, role: 'assistant', content: data.message, created_at: new Date().toISOString() },
        ]);
        if (data.updatedFiles && Object.keys(data.updatedFiles).length > 0) {
          await fetchFiles();
        }
      }
    } finally {
      setChatLoading(false);
    }
  }

  async function handleEditorChange(value: string | undefined) {
    if (!value || !selectedFile) return;
    setFiles((prev) =>
      prev.map((f) => (f.path === selectedFile ? { ...f, content: value } : f))
    );
    await fetch(`/api/projects/${params.id}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: { [selectedFile]: value } }),
    });
  }

  async function handleGitHubExport(e: React.FormEvent) {
    e.preventDefault();
    setExportLoading(true);
    try {
      const res = await fetch('/api/github/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: params.id, ...githubForm }),
      });
      if (res.ok) {
        const data = await res.json();
        setExportUrl(data.url);
      }
    } finally {
      setExportLoading(false);
    }
  }

  const selectedFileContent = files.find((f) => f.path === selectedFile)?.content || '';
  const fileTree = buildFileTree(files);

  const deviceWidths = { desktop: '100%', tablet: '768px', mobile: '375px' };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="font-semibold text-sm text-gray-200">{project?.name || 'Loading...'}</h1>
          {project && (
            <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full">{project.framework}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {generating && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <Loader2 size={14} className="animate-spin" />
              Generating...
            </div>
          )}
          <button
            onClick={() => setShowGitHubModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            <Github size={14} />
            Export to GitHub
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* File tree */}
        <aside className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
          <div className="px-3 py-3 border-b border-gray-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Files</span>
            <span className="text-xs text-gray-500">{files.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {files.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-gray-500 mb-3">No files yet</p>
                <button
                  onClick={() => setActiveRightTab('chat')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Use chat to generate →
                </button>
              </div>
            ) : (
              fileTree.map((node) => (
                <FileTreeItem
                  key={node.path}
                  node={node}
                  depth={0}
                  selectedPath={selectedFile}
                  onSelect={setSelectedFile}
                />
              ))
            )}
          </div>
          {/* Generate prompt */}
          <div className="p-3 border-t border-gray-700">
            <form
              onSubmit={(e) => { e.preventDefault(); handleGenerate(generatePrompt); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder="Generate from prompt..."
                className="flex-1 min-w-0 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={generating || !generatePrompt.trim()}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 transition-colors"
              >
                <Wand2 size={12} />
              </button>
            </form>
          </div>
        </aside>

        {/* Code editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            <>
              <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2 shrink-0">
                <FileCode size={14} className="text-gray-400" />
                <span className="text-sm text-gray-300 font-mono">{selectedFile}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <MonacoEditor
                  height="100%"
                  language={getLanguageFromPath(selectedFile)}
                  value={selectedFileContent}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileCode size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a file to edit</p>
                <p className="text-xs mt-1">or generate files using the prompt below</p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: Preview + Chat */}
        <aside className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 shrink-0">
            {(['preview', 'chat'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRightTab(tab)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                  activeRightTab === tab
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab === 'preview' ? '👁 Preview' : '💬 Chat'}
              </button>
            ))}
          </div>

          {activeRightTab === 'preview' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Device toggles */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 shrink-0">
                <div className="flex items-center gap-1">
                  {([
                    { size: 'desktop' as const, icon: Monitor },
                    { size: 'tablet' as const, icon: Tablet },
                    { size: 'mobile' as const, icon: Smartphone },
                  ]).map(({ size, icon: Icon }) => (
                    <button
                      key={size}
                      onClick={() => setDeviceSize(size)}
                      className={`p-1.5 rounded transition-colors ${deviceSize === size ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
                <button className="p-1.5 text-gray-400 hover:text-gray-200 rounded" onClick={() => {}}>
                  <RefreshCw size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-auto flex items-start justify-center bg-gray-900 p-4">
                <div
                  className="bg-white h-full min-h-64 rounded-lg overflow-hidden transition-all duration-300 shadow-lg"
                  style={{ width: deviceWidths[deviceSize], maxWidth: '100%' }}
                >
                  {files.length > 0 ? (
                    <iframe
                      srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { margin: 0; }</style>
</head>
<body>
  <div id="preview-content" class="p-6 font-sans">
    <div class="text-center py-12">
      <div class="text-5xl mb-4">🚀</div>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">${project?.name || 'Your App'}</h2>
      <p class="text-gray-500">${project?.description || 'Preview not available in browser'}</p>
      <div class="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto">
        ${files.slice(0, 4).map((f) => `<div class="bg-blue-50 rounded-lg p-3 text-left"><div class="text-xs font-medium text-blue-800 truncate">${f.path}</div><div class="text-xs text-gray-500 mt-1">${f.language}</div></div>`).join('')}
      </div>
    </div>
  </div>
</body>
</html>`}
                      className="w-full h-full border-0"
                      title="Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full p-6 text-center">
                      <div>
                        <div className="text-4xl mb-3">📱</div>
                        <p className="text-gray-500 text-sm">Generate files to see preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-3">🤖</div>
                    <p className="text-gray-400 text-sm">Ask AI to modify your app</p>
                    <div className="mt-4 space-y-2">
                      {[
                        'Add a dark mode toggle',
                        'Fix the navigation layout',
                        'Add a contact form',
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setChatInput(suggestion)}
                          className="block w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-700 text-gray-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleChat} className="p-4 border-t border-gray-700 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask AI to change your app..."
                    className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </aside>
      </div>

      {/* GitHub Export Modal */}
      {showGitHubModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-gray-900">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Github size={20} /> Export to GitHub
              </h2>
              <p className="text-gray-500 text-sm mt-1">Push your project files to a GitHub repository</p>
            </div>
            {exportUrl ? (
              <div className="p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="font-semibold text-gray-900 mb-2">Export successful!</p>
                <a href={exportUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all">{exportUrl}</a>
                <button onClick={() => { setShowGitHubModal(false); setExportUrl(''); }}
                  className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
              </div>
            ) : (
              <form onSubmit={handleGitHubExport} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Token</label>
                  <input type="password" value={githubForm.token}
                    onChange={(e) => setGithubForm((f) => ({ ...f, token: e.target.value }))}
                    placeholder="ghp_xxxxxxxxxxxx" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Username</label>
                  <input type="text" value={githubForm.owner}
                    onChange={(e) => setGithubForm((f) => ({ ...f, owner: e.target.value }))}
                    placeholder="your-username" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repository Name</label>
                  <input type="text" value={githubForm.repoName}
                    onChange={(e) => setGithubForm((f) => ({ ...f, repoName: e.target.value }))}
                    placeholder="my-app" required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowGitHubModal(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={exportLoading}
                    className="flex-1 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2">
                    {exportLoading ? <><Loader2 size={16} className="animate-spin" /> Exporting...</> : <><Github size={16} /> Export</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { Suspense } from 'react';

export default function ProjectEditorPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    }>
      <ProjectEditorContent params={params} />
    </Suspense>
  );
}
