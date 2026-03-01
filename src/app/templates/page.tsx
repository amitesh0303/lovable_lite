import Link from 'next/link';
import { TEMPLATES } from '@/lib/templates';
import { ArrowLeft } from 'lucide-react';

export default function TemplatesPage() {
  const categories = [...new Set(TEMPLATES.map((t) => t.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="h-5 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <span className="font-bold text-gray-900">Template Gallery</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Start with a Template</h1>
          <p className="text-gray-500 text-lg">Choose from our pre-built templates and customize with AI.</p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="text-lg font-semibold text-gray-700 mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.filter((t) => t.category === category).map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

function TemplateCard({ template }: { template: (typeof TEMPLATES)[0] }) {
  const fileCount = Object.keys(template.files).length;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="h-40 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <span className="text-7xl">{template.thumbnail}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{template.category}</span>
        </div>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{template.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
          <UseTemplateButton templateId={template.id} />
        </div>
      </div>
    </div>
  );
}

function UseTemplateButton({ templateId }: { templateId: string }) {
  return (
    <Link
      href={`/dashboard?template=${templateId}`}
      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
    >
      Use Template
    </Link>
  );
}
