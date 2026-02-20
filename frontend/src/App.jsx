// App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import VCFUploader from './components/VCFUploader';
import DrugInput from './components/DrugInput';
import ResultsDashboard from './components/ResultsDashboard';
import RawDataInspector from './components/RawDataInspector';
import { analyzePGx } from './services/api';

function App() {
  const [vcfFile, setVcfFile] = useState(null);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  // Load recent analyses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentAnalyses');
    if (saved) {
      setRecentAnalyses(JSON.parse(saved));
    }
  }, []);

  const handleRunAnalysis = async () => {
    if (!vcfFile || selectedDrugs.length === 0) {
      setError('Please upload a VCF file and select at least one drug');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzePGx(vcfFile, selectedDrugs);
      setAnalysisResult(result);
      
      // Save to recent analyses
      const newAnalysis = {
        id: Date.now(),
        patientId: result.patient_id,
        timestamp: new Date().toISOString(),
        drugCount: selectedDrugs.length,
        riskLevel: result.risk_label?.level
      };
      
      const updated = [newAnalysis, ...recentAnalyses.slice(0, 4)];
      setRecentAnalyses(updated);
      localStorage.setItem('recentAnalyses', JSON.stringify(updated));
      
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setShowRawData(false);
    setVcfFile(null);
    setSelectedDrugs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <i className="fas fa-dna text-white text-sm"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">PharmaGuard PGx</h1>
                <p className="text-xs text-slate-500">Pharmacogenomic Analysis Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status indicator */}
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-slate-600">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Analyzer */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
                <h2 className="text-white font-semibold flex items-center">
                  <i className="fas fa-flask mr-2"></i>
                  Analysis Console
                </h2>
                <p className="text-xs text-slate-400 mt-1">Configure your pharmacogenomic analysis</p>
              </div>
              
              <div className="p-6 space-y-6">
                <VCFUploader 
                  onFileSelected={setVcfFile}
                  selectedFile={vcfFile}
                />
                
                <DrugInput 
                  selectedDrugs={selectedDrugs}
                  onDrugsChange={setSelectedDrugs}
                />
                
                {error && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-lg">
                    <div className="flex">
                      <i className="fas fa-exclamation-circle text-rose-500 mr-3"></i>
                      <div>
                        <p className="text-sm text-rose-700 font-medium">Error</p>
                        <p className="text-xs text-rose-600 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Analysis Controls */}
                <div className="space-y-3">
                  <button
                    onClick={handleRunAnalysis}
                    disabled={isLoading || !vcfFile || selectedDrugs.length === 0}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 
                             text-white py-3 px-4 rounded-xl font-medium
                             hover:from-cyan-600 hover:to-blue-700 
                             transition-all disabled:from-slate-300 disabled:to-slate-300 
                             disabled:cursor-not-allowed disabled:hover:shadow-none
                             shadow-lg shadow-cyan-200 hover:shadow-xl
                             flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play"></i>
                        <span>Run Analysis</span>
                      </>
                    )}
                  </button>

                  {analysisResult && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowRawData(!showRawData)}
                        className="flex-1 border border-slate-200 bg-white text-slate-700 
                                 py-2 px-4 rounded-xl font-medium hover:bg-slate-50 
                                 transition-colors text-sm flex items-center justify-center space-x-2"
                      >
                        <i className={`fas fa-code ${showRawData ? 'text-cyan-500' : 'text-slate-400'}`}></i>
                        <span>{showRawData ? 'Hide JSON File' : 'View JSON File'}</span>
                      </button>
                      
                      <button
                        onClick={clearAnalysis}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                        title="New Analysis"
                      >
                        <i className="fas fa-plus text-slate-400"></i>
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Analyses */}
                {recentAnalyses.length > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Recent Analyses
                    </h3>
                    <div className="space-y-2">
                      {recentAnalyses.map(analysis => (
                        <button
                          key={analysis.id}
                          className="w-full p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                analysis.riskLevel === 'Critical' ? 'bg-rose-500' :
                                analysis.riskLevel === 'High' ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}></div>
                              <span className="text-sm font-medium text-slate-700">
                                {analysis.patientId}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {new Date(analysis.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {analysis.drugCount} drugs • {analysis.riskLevel} risk
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 mb-6">
                    {/* DNA Helix Animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <i className="fas fa-dna text-white text-2xl animate-pulse"></i>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Analyzing Genetic Data</h3>
                  <p className="text-sm text-slate-500 text-center max-w-md">
                    Processing VCF file and cross-referencing with pharmacogenomic databases. 
                    This may take a few moments...
                  </p>
                  
                  {/* Progress steps */}
                  <div className="mt-8 space-y-3 w-64">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-emerald-600 text-xs"></i>
                      </div>
                      <span className="text-sm text-slate-600">VCF validation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-cyan-600 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-sm text-slate-600 font-medium">Variant calling</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      </div>
                      <span className="text-sm text-slate-400">Clinical interpretation</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Raw Data View */}
            {!isLoading && showRawData && analysisResult && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <RawDataInspector data={analysisResult} />
              </div>
            )}

            {/* Results Dashboard */}
            {!isLoading && analysisResult && !showRawData && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ResultsDashboard data={analysisResult} />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !analysisResult && !error && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-6">
                    <i className="fas fa-dna text-4xl text-slate-400"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Welcome to PharmaGuard PGx
                  </h3>
                  <p className="text-slate-500 max-w-md mb-8">
                    Upload a VCF file and select drugs of interest to begin pharmacogenomic analysis. 
                    Get instant insights into drug-gene interactions.
                  </p>
                  
                  {/* Feature grid */}
                  <div className="grid grid-cols-3 gap-4 max-w-2xl">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-bolt text-cyan-600"></i>
                      </div>
                      <p className="text-xs font-medium text-slate-700">Real-time analysis</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-shield-alt text-purple-600"></i>
                      </div>
                      <p className="text-xs font-medium text-slate-700">HIPAA compliant</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-robot text-emerald-600"></i>
                      </div>
                      <p className="text-xs font-medium text-slate-700">AI-powered insights</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <div className="flex items-center space-x-4">
              <span>© 2026 Team_Garudaa. All rights reserved.</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>v1.0.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="https://rift2026.vercel.app/" target='_blank' className="hover:text-slate-700 transition-colors">RIFT 2026</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;