

import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface ProjectUploadProps {
    onUpload: (files: File[], prd: string) => void;
    isLoading: boolean;
}

export const ProjectUpload: React.FC<ProjectUploadProps> = ({ onUpload, isLoading }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [prd, setPrd] = useState<string>('');
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(selectedFiles);
            onUpload(selectedFiles, prd);
        }
    };
    
    const handlePrdChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newPrd = e.target.value;
        setPrd(newPrd);
        onUpload(files, newPrd);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            setFiles(droppedFiles);
            onUpload(droppedFiles, prd);
        }
    };

    return (
        <div className="space-y-6 bg-gray-900 p-6 rounded-lg">
            <div>
                <h2 className="text-lg font-semibold text-gray-200 mb-2">1. Upload Project Files</h2>
                <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center transition-colors duration-200 ${dragActive ? 'bg-gray-700' : 'bg-gray-800'}`}>
                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        // Fix: The 'webkitdirectory' attribute is non-standard and causes a TypeScript error
                        // because it's not in React's HTML attribute types. Spreading it as a property
                        // on an object bypasses the type checker.
                        {...{ webkitdirectory: "" }}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                    />
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                        <UploadIcon className="w-8 h-8 text-gray-500" />
                        <p className="text-gray-400">
                            <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">Select your project folder</p>
                    </label>
                </div>
                {files.length > 0 && (
                    <div className="mt-4 text-sm text-gray-400">
                        <p className="font-semibold">{files.length} file(s) selected:</p>
                        <ul className="list-disc list-inside max-h-32 overflow-y-auto mt-1">
                            {files.slice(0, 10).map((file, i) => (
                                <li key={i} className="truncate">{file.webkitRelativePath || file.name}</li>
                            ))}
                             {files.length > 10 && <li>...and {files.length - 10} more</li>}
                        </ul>
                    </div>
                )}
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-200 mb-2">2. Provide Initial PRD (Optional)</h2>
                <textarea
                    value={prd}
                    onChange={handlePrdChange}
                    placeholder="Paste an existing PRD or write down initial project requirements here..."
                    className="w-full h-40 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow text-gray-300"
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};
