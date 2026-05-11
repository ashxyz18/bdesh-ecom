import { NextRequest, NextResponse } from 'next/server';
import { removeTemplate } from '@/lib/templates/registry';

interface RouteParams {
  params: Promise<{ templateId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;

    const result = await removeTemplate(templateId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { templateId } = await params;

    if (templateId === 'koskii') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the default Koskii template' },
        { status: 403 }
      );
    }

    const result = await removeTemplate(templateId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}