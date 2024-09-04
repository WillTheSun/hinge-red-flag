'use client'

import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import { FaTrafficLight, FaRedo, FaShare, FaSpinner } from 'react-icons/fa';

interface Analysis {
  score: number;
  red_flags: string[];
  green_flags: string[];
}

const getScoreLabel = (score: number) => {
  if (score <= 1) return { label: 'Safe', color: 'text-green-600' };
  if (score <= 2) return { label: 'Low Risk', color: 'text-green-500' };
  if (score <= 3) return { label: 'Be Cautious', color: 'text-yellow-500' };
  if (score <= 4) return { label: 'High Alert', color: 'text-orange-500' };
  return { label: 'Danger', color: 'text-red-600' };
};

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
      <div className="text-center w-full max-w-5xl mb-6">
        <h1 className="text-3xl font-bold text-[#5B9BD5] mb-2 pt-2">Hinge Red Flag Check</h1>
        <h2 className="text-sm text-gray-700">Analyze your matches for red flags and green lights</h2>
      </div>

      <div className="w-full max-w-5xl flex-grow flex flex-col">
        {analysis && (
          <div className="w-full mb-4">
            <h3 className="text-lg font-bold text-gray-800 text-center mb-4">Analysis Result</h3>
            
            {/* Red Flag Score Display */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
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
                <span className="text-sm font-bold text-gray-800">{analysis.score}/5</span>
              </div>
              <span className={`text-sm font-bold ${getScoreLabel(analysis.score).color}`}>
                {getScoreLabel(analysis.score).label}
              </span>
            </div>

            {/* Red Flags */}
            <div className="mt-6 bg-[#FDE2E2] p-4 rounded-lg shadow">
              <h4 className="text-lg font-bold text-[#D0021B] mb-2">Red Flags</h4>
              <ul className="list-none pl-0 space-y-1">
                {analysis.red_flags.slice(0, 3).map((flag, index) => (
                  <li key={index} className="flex items-start text-[#D0021B] text-sm">
                    <span className="mr-2 text-xs flex-shrink-0 mt-0.5">🚩</span>
                    <span className="mt-0.5">{flag}</span>
                  </li>
                ))}
              </ul>
              {analysis.red_flags.length > 3 && (
                <p className="text-xs text-[#D0021B] mt-1 italic">
                  {analysis.red_flags.length - 3} more red flag{analysis.red_flags.length - 3 > 1 ? 's' : ''} hidden
                </p>
              )}
            </div>

            {/* Green Flags */}
            <div className="mt-6 bg-[#E2F5E2] p-4 rounded-lg shadow">
              <h4 className="text-lg font-bold text-[#2ECC40] mb-2">Green Flags</h4>
              <ul className="list-none pl-0 space-y-1">
                {analysis.green_flags.map((flag, index) => (
                  <li key={index} className="flex items-start text-[#2ECC40] text-sm">
                    <span className="mr-2 text-xs flex-shrink-0 mt-1">✅</span>
                    <span className="mt-0.5">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* New Feature: Unlock Advanced Analysis */}
            {/* <div className="mt-6 bg-white p-4 rounded-lg shadow border border-[#5B9BD5]">
              <h4 className="text-xl font-bold text-[#5B9BD5] mb-3">Unlock Advanced Analysis</h4>
              <p className="text-gray-700 mb-3">
                Unlock deeper insights with personalized questions and a comprehensive report.
              </p>
              <button
                className="w-full bg-gradient-to-b from-[#5B9BD5] to-[#3D7EAA] hover:from-[#3D7EAA] hover:to-[#2A5A8A] text-white font-bold py-2 px-4 rounded-md text-base transition duration-300 shadow-md hover:shadow-lg mb-3"
              >
                Unlock Advanced Analysis
              </button>
              <p className="text-sm text-gray-600">
                From $9.99 | Custom Questions | Detailed Report
              </p>
            </div> */}
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
