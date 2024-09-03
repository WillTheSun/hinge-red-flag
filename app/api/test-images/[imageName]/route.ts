import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: { imageName: string } }) {
  const { imageName } = params;
  const rootDir = process.cwd();
  const filePath = path.join(rootDir + '/testImages', imageName);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileType = path.extname(filePath).substring(1);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': `image/${fileType}`,
      'Content-Disposition': `inline; filename="${imageName}"`,
    },
  });
}