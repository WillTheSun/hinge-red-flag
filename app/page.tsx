'use client'

import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import { FaTrafficLight, FaRedo, FaShare, FaSpinner } from 'react-icons/fa';

interface Analysis {
  score: number;
  red_flags: string[];
  green_flags: string[];
}

export default function Home() {
  const [stripImage, setStripImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStripGenerated = (strip: string) => {
    setStripImage(strip);
  };

  const handleAnalyze = async () => {
    if (!stripImage) return;

    setIsLoading(true);
    const payload = { image: stripImage };

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
    } finally {
      setIsLoading(false);
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
    <main className="flex min-h-screen flex-col items-center justify-start p-6 md:p-12 bg-[#F5F5F5] relative overflow-hidden">
      <div className="text-center w-full max-w-5xl mb-8">
        <h1 className="text-3xl font-bold text-[#5B9BD5] mb-2">Hinge Red Flag Check</h1>
        <h2 className="text-sm text-gray-700">Analyze your matches for red flags and green lights</h2>
      </div>

      <div className="w-full max-w-5xl flex-grow flex flex-col">
        {analysis && (
          <div className="w-full mb-8">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-4">Analysis Result:</h3>
            
            {/* Red Flag Score Display */}
            <div className="mb-4 bg-[#F0F0F0] p-4 rounded-lg shadow-md">
              <p className="text-lg font-bold mb-2 text-gray-800">Red Flag Score:</p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {getTrafficLightColors(analysis.score).map(({ color, opacity }, index) => (
                    <div key={index} className="relative">
                      <FaTrafficLight className="text-2xl text-gray-400" style={{ opacity }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          style={{ 
                            width: '0.375rem', 
                            height: '0.375rem', 
                            borderRadius: '9999px', 
                            backgroundColor: color, 
                            opacity 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <span className="text-3xl font-bold text-gray-800">{analysis.score}/5</span>
              </div>
            </div>

            {/* Red Flags */}
            <div className="mt-6 bg-[#FDE2E2] p-4 rounded-lg shadow">
              <h4 className="text-xl font-extrabold text-[#D0021B] mb-3">Red Flags:</h4>
              <ul className="list-none pl-0 space-y-2">
                {analysis.red_flags.map((flag, index) => (
                  <li key={index} className="flex items-start text-[#D0021B] text-base">
                    <span className="mr-2 text-base flex-shrink-0 mt-0.5">🚩</span>
                    <span className="mt-0.5">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Green Flags */}
            <div className="mt-6 bg-[#E2F5E2] p-4 rounded-lg shadow">
              <h4 className="text-xl font-extrabold text-[#2ECC40] mb-3">Green Flags:</h4>
              <ul className="list-none pl-0 space-y-2">
                {analysis.green_flags.map((flag, index) => (
                  <li key={index} className="flex items-start text-[#2ECC40] text-base">
                    <span className="mr-2 text-base flex-shrink-0 mt-0.5">✅</span>
                    <span className="mt-0.5">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!analysis && !isLoading && (
          <div className="flex-grow flex flex-col items-center justify-center">
            <ImageUpload onStripGenerated={handleStripGenerated} />
            <div className="mt-8">
              <button
                onClick={handleAnalyze}
                className="bg-gradient-to-b from-[#5B9BD5] to-[#3D7EAA] hover:from-[#3D7EAA] hover:to-[#2A5A8A] text-white font-bold py-1.5 px-4 rounded-md text-base transition duration-300 flex items-center shadow-md hover:shadow-lg"
                disabled={!stripImage || isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-1.5 text-xl" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="mr-1.5 text-xl">🔍</span>
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex-grow flex flex-col items-center justify-center">
            <FaSpinner className="animate-spin text-4xl text-[#007BFF] mb-4" />
            <p className="text-lg font-semibold text-gray-700">Analyzing your image...</p>
          </div>
        )}

        {/* Action buttons at the bottom */}
        {analysis && (
          <div className="mt-auto pt-6 flex justify-center gap-3">
            <button
              onClick={handleReanalyze}
              className="bg-gradient-to-b from-[#5B9BD5] to-[#3D7EAA] hover:from-[#3D7EAA] hover:to-[#2A5A8A] text-white font-bold p-2 rounded-md transition duration-300 flex items-center justify-center w-10 h-10 shadow-md hover:shadow-lg"
              aria-label="Reanalyze"
            >
              <FaRedo className="text-lg" />
            </button>
            <button 
              className="bg-gradient-to-b from-[#5B9BD5] to-[#3D7EAA] hover:from-[#3D7EAA] hover:to-[#2A5A8A] text-white font-bold p-2 rounded-md transition duration-300 flex items-center justify-center w-10 h-10 shadow-md hover:shadow-lg"
              aria-label="Share"
            >
              <FaShare className="text-lg" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
