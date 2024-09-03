import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const rootDir = process.cwd();
  const files = fs.readdirSync(rootDir + '/testImages');
  const screenshotFiles = files.filter(file => file.startsWith('Screenshot') && file.match(/\.(jpg|jpeg|png|gif)$/i));
  return NextResponse.json(screenshotFiles);
}