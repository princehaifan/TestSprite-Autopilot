
import { Type } from "@google/genai";
import type { Schema } from "@google/genai";

export const NORMALIZED_PRD_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        app_name: { type: Type.STRING, description: "The name of the application." },
        overview: { type: Type.STRING, description: "A brief description of the application's purpose." },
        goals: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier for the goal, e.g., 'G001'." },
                    description: { type: Type.STRING, description: "A description of the goal." }
                },
                required: ["id", "description"]
            }
        },
        user_stories: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier for the user story, e.g., 'US001'." },
                    as_a: { type: Type.STRING, description: "The user persona." },
                    i_want: { type: Type.STRING, description: "The user's need or action." },
                    so_that: { type: Type.STRING, description: "The benefit or reason for the need." }
                },
                required: ["id", "as_a", "i_want", "so_that"]
            }
        },
        functional_requirements: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier for the requirement, e.g., 'FR001'." },
                    description: { type: Type.STRING, description: "A detailed description of the functional requirement." }
                },
                required: ["id", "description"]
            }
        },
        non_functional_requirements: {
            type: Type.OBJECT,
            properties: {
                performance: { type: Type.STRING, description: "Performance-related requirements." },
                security: { type: Type.STRING, description: "Security-related requirements." }
            }
        }
    },
    required: ["app_name", "overview", "goals", "user_stories", "functional_requirements"]
};

export const TEST_PLAN_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        project_name: { type: Type.STRING, description: "The name of the project being tested." },
        test_plan_version: { type: Type.STRING, description: "The version of this test plan, e.g., '1.0'." },
        test_cases: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier for the test case, e.g., 'TC001'." },
                    title: { type: Type.STRING, description: "A concise title for the test case." },
                    description: { type: Type.STRING, description: "A brief description of what this test case covers." },
                    category: { type: Type.STRING, description: "The category of the test, e.g., 'Functional', 'UI/UX', 'Security'." },
                    priority: { type: Type.STRING, description: "The priority of the test case: 'Low', 'Medium', 'High', 'Critical'." },
                    steps: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "A list of steps to execute the test."
                    },
                    expected_result: { type: Type.STRING, description: "The expected outcome after executing the steps." }
                },
                required: ["id", "title", "description", "category", "priority", "steps", "expected_result"]
            }
        }
    },
    required: ["project_name", "test_plan_version", "test_cases"]
};
