import { NextRequest, NextResponse } from 'next/server';
import { generateAppFromPrompt } from '@/lib/openai';
import { supabase } from '@/lib/supabase';
import { getLanguageFromPath } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prompt, projectId } = body;

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const generatedApp = await generateAppFromPrompt(prompt);

    if (projectId) {
      await supabase.from('project_files').upsert(
        Object.entries(generatedApp.files).map(([path, content]) => ({
          project_id: projectId,
          path,
          content: content as string,
          language: getLanguageFromPath(path),
        })),
        { onConflict: 'project_id,path' }
      );

      await supabase
        .from('projects')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', projectId);
    }

    return NextResponse.json(generatedApp);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Failed to generate app' }, { status: 500 });
  }
}
