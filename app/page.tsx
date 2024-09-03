'use client'

import { useState } from 'react';
import ImageUpload from './components/ImageUpload';

interface Analysis {
  red_flag_score: number;
  red_flags: string[];
  green_flags: string[];
}

export default function Home() {
  const [stripImage, setStripImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleStripGenerated = (strip: string) => {
    setStripImage(strip);
  };

  const handleAnalyze = async () => {
    if (!stripImage) return;

    const formData = new FormData();
    formData.append('image', dataURItoBlob(stripImage));

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const res = await response.json();
        console.log(res);
        setAnalysis(res.result);
      } else {
        console.error('Analysis failed');
      }
    } catch (error) {
      console.error('Error during analysis:', error);
    }
  };

  // Helper function to convert data URI to Blob
  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="text-center mb-8 w-full max-w-4xl">
        <h1 className="text-2xl font-bold">Hinge Red Flag Check</h1>
        <h2 className="text text-gray-600">Analyze your matches for red flags</h2>
      </div>

      <ImageUpload onStripGenerated={handleStripGenerated} />

      {analysis && (
        <div className="mt-8 w-full max-w-4xl">
          <h3 className="text-xl font-bold mb-2">Analysis Result:</h3>
          <p>Red Flag Score: {analysis.red_flag_score}</p>
          <div className="mt-4">
            <h4 className="text-lg font-semibold">Red Flags:</h4>
            <ul className="list-disc pl-5">
              {analysis.red_flags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-semibold">Green Flags:</h4>
            <ul className="list-disc pl-5">
              {analysis.green_flags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleAnalyze}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!stripImage}
        >
          {analysis ? 'Reanalyze' : 'Analyze'}
        </button>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Save Results
        </button>
        <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
          Share
        </button>
      </div>
    </main>
  );
}
