import { NextRequest, NextResponse } from 'next/server';
import { generateCodeEdit } from '@/lib/openai';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, projectId } = body;

  if (!message || !projectId) {
    return NextResponse.json({ error: 'Message and projectId required' }, { status: 400 });
  }

  try {
    const { data: files } = await supabase
      .from('project_files')
      .select('path, content')
      .eq('project_id', projectId);

    const currentFiles: Record<string, string> = {};
    (files || []).forEach((f) => {
      currentFiles[f.path] = f.content;
    });

    const { data: chatHistory } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(10);

    await supabase.from('chat_messages').insert({
      project_id: projectId,
      role: 'user',
      content: message,
    });

    const updatedFiles = await generateCodeEdit(message, currentFiles, chatHistory || []);

    if (Object.keys(updatedFiles).length > 0) {
      await supabase.from('project_files').upsert(
        Object.entries(updatedFiles).map(([path, content]) => ({
          project_id: projectId,
          path,
          content: content as string,
          language: getLanguageFromPath(path),
        })),
        { onConflict: 'project_id,path' }
      );
    }

    const assistantMessage = Object.keys(updatedFiles).length > 0
      ? `I've updated ${Object.keys(updatedFiles).length} file(s): ${Object.keys(updatedFiles).join(', ')}`
      : "I've analyzed your request but no code changes were needed.";

    await supabase.from('chat_messages').insert({
      project_id: projectId,
      role: 'assistant',
      content: assistantMessage,
    });

    return NextResponse.json({ message: assistantMessage, updatedFiles });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescriptreact', js: 'javascript', jsx: 'javascriptreact',
    css: 'css', json: 'json', md: 'markdown', html: 'html',
  };
  return map[ext || ''] || 'plaintext';
}
