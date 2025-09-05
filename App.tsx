import React, { useState, useCallback } from 'react';
import { ProjectUpload } from './components/ProjectUpload';
import { ProcessStepper } from './components/ProcessStepper';
import { ResultsDisplay } from './components/ResultsDisplay';
import { generateCodeSummary, generateNormalizedPrd, generateTestPlan, generateTestCode } from './services/geminiService';
import type { Step, Results, NormalizedPrd, TestPlan, Framework } from './types';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
    const [projectFiles, setProjectFiles] = useState<File[]>([]);
    const [initialPrd, setInitialPrd] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<Step>('IDLE');
    const [framework, setFramework] = useState<Framework>('playwright');
    const [results, setResults] = useState<Results>({
        codeSummary: null,
        normalizedPrd: null,
        testPlan: null,
        testCode: null,
    });
    const [error, setError] = useState<string | null>(null);

    const handleUpload = useCallback((files: File[], prd: string) => {
        setProjectFiles(files);
        setInitialPrd(prd);
        setResults({ codeSummary: null, normalizedPrd: null, testPlan: null, testCode: null });
        setError(null);
        setCurrentStep('IDLE');
    }, []);

    const handleStartAutopilot = async () => {
        if (projectFiles.length === 0) {
            setError("Please upload project files before starting.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults({ codeSummary: null, normalizedPrd: null, testPlan: null, testCode: null });

        try {
            setCurrentStep('SUMMARIZING');
            const summary = await generateCodeSummary(projectFiles);
            setResults(prev => ({ ...prev, codeSummary: summary }));

            setCurrentStep('GENERATING_PRD');
            const prd = await generateNormalizedPrd(summary, initialPrd);
            setResults(prev => ({ ...prev, normalizedPrd: prd as NormalizedPrd }));

            setCurrentStep('GENERATING_TEST_PLAN');
            const plan = await generateTestPlan(summary, prd);
            setResults(prev => ({ ...prev, testPlan: plan as TestPlan }));

            setCurrentStep('GENERATING_TEST_CODE');
            const code = await generateTestCode(plan, framework);
            setResults(prev => ({ ...prev, testCode: code }));

            setCurrentStep('DONE');
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed at step ${currentStep}: ${errorMessage}`);
            setCurrentStep('IDLE');
        } finally {
            setIsLoading(false);
        }
    };
    
    const hasResults = results.codeSummary || results.normalizedPrd || results.testPlan || results.testCode;

    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-gray-950">
            <header className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-700">
                <LogoIcon className="h-8 w-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-gray-200">TestSprite Autopilot</h1>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
                <aside className="flex flex-col space-y-6">
                    <ProjectUpload onUpload={handleUpload} isLoading={isLoading} />
                    
                    <div className="bg-gray-900 p-6 rounded-lg space-y-2">
                        <label htmlFor="framework-select" className="block text-lg font-semibold text-gray-200">
                            3. Select Test Framework
                        </label>
                        <select
                            id="framework-select"
                            value={framework}
                            onChange={(e) => setFramework(e.target.value as Framework)}
                            disabled={isLoading}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow text-gray-300"
                            aria-label="Select testing framework"
                        >
                            <option value="playwright">Playwright</option>
                            <option value="cypress">Cypress</option>
                            <option value="jest">Jest</option>
                        </select>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={handleStartAutopilot}
                            disabled={isLoading || projectFiles.length === 0}
                            className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                            {isLoading ? 'Processing...' : 'Start Autopilot'}
                        </button>
                        {error && <div role="alert" className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
                    </div>
                    <ProcessStepper currentStep={currentStep} />
                </aside>
                
                <main className="bg-gray-900 rounded-lg p-1 overflow-hidden">
                    { hasResults || isLoading ? (
                        <ResultsDisplay results={results} isLoading={isLoading} currentStep={currentStep} />
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="text-center p-8">
                                <LogoIcon className="h-16 w-16 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold mb-2">Welcome to TestSprite Autopilot</h2>
                                <p>Upload your project files, provide an optional PRD, and click "Start Autopilot" to begin.</p>
                            </div>
                         </div>
                     )}
                </main>
            </div>
        </div>
    );
};

export default App;