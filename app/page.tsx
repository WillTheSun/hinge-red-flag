'use client'

import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import { FaTrafficLight } from 'react-icons/fa';

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

  const handleReanalyze = () => {
    setAnalysis(null);
    setStripImage(null);
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

  const getTrafficLightColors = (score: number) => {
    const colors = Array(5).fill({ color: 'gray', opacity: 0.3 });
    const activeColor = score <= 2 ? 'green' : score <= 4 ? 'yellow' : 'red';
    for (let i = 0; i < score; i++) {
      colors[i] = { color: activeColor, opacity: 1 };
    }
    return colors;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-12 bg-gray-50">
      <div className="text-center w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-[#2A70C2] mb-2">Hinge Red Flag Check</h1>
        <h2 className="text-sm text-gray-700 mb-4">Analyze your matches for red flags and green lights</h2>
      </div>

      {!analysis && (
        <>
          <ImageUpload onStripGenerated={handleStripGenerated} />
          <div className="mt-8">
            <button
              onClick={handleAnalyze}
              className="bg-[#2A70C2] hover:bg-[#1A60B2] text-white font-bold py-2 px-6 rounded-lg text-lg transition duration-300"
              disabled={!stripImage}
            >
              Analyze
            </button>
          </div>
        </>
      )}

      {analysis && (
        <div className="w-full max-w-5xl">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Analysis Result:</h3>
          
          {/* Red Flag Score Display */}
          <div className="mb-6 bg-[#F5F5F5] p-6 rounded-lg shadow-md">
            <p className="text-xl font-bold mb-3 text-gray-800">Red Flag Score:</p>
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {getTrafficLightColors(analysis.red_flag_score).map(({ color, opacity }, index) => (
                  <div key={index} className="relative">
                    <FaTrafficLight className="text-4xl text-gray-400" style={{ opacity }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className={`w-3 h-3 rounded-full bg-${color}-500`} 
                        style={{ opacity }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-4xl font-bold text-gray-800">{analysis.red_flag_score}/5</span>
            </div>
          </div>

          {/* Red Flags */}
          <div className="mt-8 bg-[#FDECEA] p-6 rounded-lg shadow">
            <h4 className="text-2xl font-extrabold text-[#B0011B] mb-4">Red Flags:</h4>
            <ul className="list-none pl-0 space-y-3">
              {analysis.red_flags.map((flag, index) => (
                <li key={index} className="flex items-start text-[#B0011B] text-base">
                  <span className="mr-3 text-lg mt-0.5">🚩</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Green Flags */}
          <div className="mt-10 bg-[#EAF6EA] p-6 rounded-lg shadow">
            <h4 className="text-2xl font-extrabold text-[#5ED301] mb-4">Green Flags:</h4>
            <ul className="list-none pl-0 space-y-3">
              {analysis.green_flags.map((flag, index) => (
                <li key={index} className="flex items-start text-[#5ED301] text-base">
                  <span className="mr-3 text-lg mt-0.5">✅</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-4 justify-center w-full">
        {analysis && (
          <>
            <button
              onClick={handleReanalyze}
              className="bg-[#2A70C2] hover:bg-[#1A60B2] text-white font-bold py-2 px-4 sm:px-6 rounded-lg text-base sm:text-lg transition duration-300 flex-1 max-w-[200px]"
            >
              Reanalyze
            </button>
            <button className="bg-[#2A70C2] hover:bg-[#1A60B2] text-white font-bold py-2 px-4 sm:px-6 rounded-lg text-base sm:text-lg transition duration-300 flex-1 max-w-[200px]">
              Share
            </button>
          </>
        )}
      </div>
    </main>
  );
}
