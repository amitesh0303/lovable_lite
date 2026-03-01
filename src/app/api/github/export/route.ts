import { NextRequest, NextResponse } from 'next/server';
import { exportToGitHub } from '@/lib/github';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, githubToken, owner, repoName } = body;

  if (!projectId || !githubToken || !owner || !repoName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    const { data: files } = await supabase
      .from('project_files')
      .select('path, content')
      .eq('project_id', projectId);

    const fileMap: Record<string, string> = {};
    (files || []).forEach((f) => {
      fileMap[f.path] = f.content;
    });

    const repoUrl = await exportToGitHub(
      githubToken,
      owner,
      repoName,
      fileMap,
      project?.name || 'My App'
    );

    return NextResponse.json({ url: repoUrl });
  } catch (error) {
    console.error('GitHub export error:', error);
    return NextResponse.json({ error: 'Failed to export to GitHub' }, { status: 500 });
  }
}
