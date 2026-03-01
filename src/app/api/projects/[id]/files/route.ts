import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', id)
    .order('path');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from('project_files')
    .upsert(
      Object.entries(body.files as Record<string, string>).map(([path, content]) => ({
        project_id: id,
        path,
        content,
        language: getLanguageFromPath(path),
      })),
      { onConflict: 'project_id,path' }
    )
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescriptreact', js: 'javascript', jsx: 'javascriptreact',
    css: 'css', json: 'json', md: 'markdown', html: 'html',
  };
  return map[ext || ''] || 'plaintext';
}
