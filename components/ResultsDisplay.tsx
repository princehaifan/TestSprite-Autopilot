import React, { useState } from 'react';
import type { Results, Step } from '../types';
import { SummaryIcon, PrdIcon, TestPlanIcon, DownloadIcon, TestCodeIcon } from './icons';

interface ResultsDisplayProps {
    results: Results;
    isLoading: boolean;
    currentStep: Step;
}

const LoadingIndicator: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-pulse">
        <svg className="animate-spin h-10 w-10 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg font-medium">{text}...</p>
    </div>
);

const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const DownloadButton: React.FC<{ onDownload: () => void }> = ({ onDownload }) => (
    <button
        onClick={onDownload}
        title="Download file"
        aria-label="Download file"
        className="absolute top-3 right-3 p-2 bg-gray-700/50 hover:bg-gray-600 rounded-full text-gray-400 hover:text-white transition-colors"
    >
        <DownloadIcon className="w-5 h-5" />
    </button>
);


const JsonViewer: React.FC<{ data: object | null; filename: string }> = ({ data, filename }) => {
    if (!data) return null;
    const content = JSON.stringify(data, null, 2);
    return (
        <div className="relative">
            <DownloadButton onDownload={() => handleDownload(content, filename)} />
            <pre className="text-sm bg-gray-950 p-4 rounded-md overflow-x-auto text-gray-300">
                <code>{content}</code>
            </pre>
        </div>
    );
};

const MarkdownViewer: React.FC<{ text: string | null, filename: string }> = ({ text, filename }) => {
    if (!text) return null;
    // A simple markdown to HTML converter
    const formattedText = text
        .split('\n')
        .map(line => {
            if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
            if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
            if (line.startsWith('* ')) return `<li>${line.substring(2)}</li>`;
            return `<p>${line}</p>`;
        })
        .join('')
        .replace(/<li>/g, '<ul><li>')
        .replace(/<\/li>(?!<li>)/g, '</li></ul>');

    return (
        <div className="relative">
            <DownloadButton onDownload={() => handleDownload(text, filename)} />
            <div 
                className="prose prose-invert prose-sm max-w-none text-gray-300 p-4"
                dangerouslySetInnerHTML={{ __html: formattedText }}
            />
        </div>
    );
};

const CodeViewer: React.FC<{ code: string | null; filename: string }> = ({ code, filename }) => {
    if (!code) return null;
    return (
        <div className="relative">
             <DownloadButton onDownload={() => handleDownload(code, filename)} />
            <pre className="text-sm bg-gray-950 p-4 rounded-md overflow-x-auto text-gray-300">
                <code>{code}</code>
            </pre>
        </div>
    );
};

type Tab = 'summary' | 'prd' | 'plan' | 'code';

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading, currentStep }) => {
    const [activeTab, setActiveTab] = useState<Tab>('summary');

    const renderContent = () => {
        if (isLoading && !results.codeSummary) {
            let loadingText = "Starting Autopilot";
            if(currentStep === 'SUMMARIZING') loadingText = "Generating Code Summary";
            if(currentStep === 'GENERATING_PRD') loadingText = "Generating Normalized PRD";
            if(currentStep === 'GENERATING_TEST_PLAN') loadingText = "Generating Test Plan";
            if(currentStep === 'GENERATING_TEST_CODE') loadingText = "Generating Test Code";
            return <LoadingIndicator text={loadingText} />;
        }

        switch (activeTab) {
            case 'summary':
                return results.codeSummary ? <MarkdownViewer text={results.codeSummary} filename="summary.md" /> : (isLoading && currentStep === 'SUMMARIZING' ? <LoadingIndicator text="Generating Code Summary" /> : null);
            case 'prd':
                return results.normalizedPrd ? <JsonViewer data={results.normalizedPrd} filename="prd.json" /> : (isLoading && currentStep === 'GENERATING_PRD' ? <LoadingIndicator text="Generating Normalized PRD" /> : null);
            case 'plan':
                return results.testPlan ? <JsonViewer data={results.testPlan} filename="test-plan.json" /> : (isLoading && currentStep === 'GENERATING_TEST_PLAN' ? <LoadingIndicator text="Generating Test Plan" /> : null);
            case 'code':
                return results.testCode ? <CodeViewer code={results.testCode} filename="test-code.js" /> : (isLoading && currentStep === 'GENERATING_TEST_CODE' ? <LoadingIndicator text="Generating Test Code" /> : null);
            default:
                return null;
        }
    };
    
    const TabButton = ({ tabId, icon: Icon, label }: { tabId: Tab, icon: React.FC<React.SVGProps<SVGSVGElement>>, label: string}) => (
        <button
            role="tab"
            aria-selected={activeTab === tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 ${
                activeTab === tabId
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg">
            <div className="flex-shrink-0 border-b border-gray-700">
                <nav className="-mb-px flex space-x-4 px-4" role="tablist" aria-label="Results tabs">
                   <TabButton tabId="summary" icon={SummaryIcon} label="Code Summary" />
                   <TabButton tabId="prd" icon={PrdIcon} label="Normalized PRD" />
                   <TabButton tabId="plan" icon={TestPlanIcon} label="Test Plan" />
                   <TabButton tabId="code" icon={TestCodeIcon} label="Test Code" />
                </nav>
            </div>
            <div className="flex-grow overflow-auto" role="tabpanel">
                {renderContent()}
            </div>
        </div>
    );
};