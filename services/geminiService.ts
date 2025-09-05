import { GoogleGenAI } from "@google/genai";
import { NORMALIZED_PRD_SCHEMA, TEST_PLAN_SCHEMA } from '../constants';
import type { Framework } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatFilesForPrompt = async (files: File[]): Promise<string> => {
    const fileContentsPromises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const content = reader.result as string;
                const filePath = (file as any).webkitRelativePath || file.name;
                resolve(`--- FILE: ${filePath} ---\n\n${content}\n\n`);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    });

    const fileContents = await Promise.all(fileContentsPromises);
    return fileContents.join('');
};

export const generateCodeSummary = async (files: File[]): Promise<string> => {
    const codeContent = await formatFilesForPrompt(files);
    
    const prompt = `
        You are an expert software architect. Analyze the following code files from a project and provide a high-level summary.
        
        Your summary should cover:
        1.  The project's main purpose and features.
        2.  The overall architecture and structure (e.g., components, services, pages).
        3.  Key technologies or libraries used.

        The output should be a concise markdown text, suitable for a technical audience.

        Project Files:
        ${codeContent}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
};

export const generateNormalizedPrd = async (codeSummary: string, initialPrd?: string): Promise<object> => {
    const prompt = `
        You are an expert Product Manager. Based on the provided code summary and any initial requirements, generate a structured and normalized Product Requirement Document (PRD) in JSON format.
        
        The JSON output MUST strictly adhere to the provided schema.
        Infer user stories and functional requirements from the code's capabilities. If the code mentions an admin panel, create requirements for it.
        Be comprehensive and logical.

        **Code Summary:**
        ${codeSummary}

        **Initial Requirements (if any):**
        ${initialPrd || 'None provided. Generate the PRD based solely on the code summary.'}
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: NORMALIZED_PRD_SCHEMA,
        },
    });
    
    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse PRD JSON:", response.text);
        throw new Error("Received invalid JSON format for PRD from the API.");
    }
};

export const generateTestPlan = async (codeSummary: string, normalizedPrd: object): Promise<object> => {
    const prompt = `
        You are an expert QA Engineer specializing in test automation. Analyze the provided code summary and normalized PRD to create a comprehensive frontend test plan in JSON format.
        
        The test plan should cover a wide range of scenarios:
        -   **Functional:** Core features and user stories.
        -   **UI/UX:** Layout, responsiveness, and user experience.
        -   **Security:** Common vulnerabilities like unauthorized access.
        -   **Error Handling:** How the app behaves with invalid input or server errors.
        -   **Edge Cases:** Unlikely but possible scenarios.

        Each test case must be detailed and actionable. The JSON output MUST strictly adhere to the provided schema.

        **Code Summary:**
        ${codeSummary}

        **Normalized PRD:**
        ${JSON.stringify(normalizedPrd, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: TEST_PLAN_SCHEMA,
        },
    });
    
    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse Test Plan JSON:", response.text);
        throw new Error("Received invalid JSON format for Test Plan from the API.");
    }
};

export const generateTestCode = async (testPlan: object, framework: Framework): Promise<string> => {
    const frameworkName = framework.charAt(0).toUpperCase() + framework.slice(1);

    const prompt = `
        You are an expert Test Automation Engineer. Based on the provided JSON test plan, generate executable test code using the **${frameworkName}** framework.

        **Instructions:**
        1.  Create a complete, runnable test file.
        2.  Include necessary imports and setup for ${frameworkName}.
        3.  Implement each test case from the test plan.
        4.  Use clear descriptions for test blocks, mapping them to the test case titles from the plan.
        5.  Use best practices for writing clean and maintainable test code. Assume the application is running on \`localhost:3000\`.
        6.  The output should be a single block of code, ready to be saved into a file (e.g., \`spec.cy.js\` for Cypress, \`test.spec.js\` for Jest/Playwright).

        **Test Plan:**
        ${JSON.stringify(testPlan, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    let code = response.text;
    if (code.startsWith('```') && code.endsWith('```')) {
        code = code.split('\n').slice(1, -1).join('\n');
    }
    
    return code;
};