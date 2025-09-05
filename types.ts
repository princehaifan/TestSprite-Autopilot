export type Step = 'IDLE' | 'SUMMARIZING' | 'GENERATING_PRD' | 'GENERATING_TEST_PLAN' | 'GENERATING_TEST_CODE' | 'DONE';

export type Framework = 'playwright' | 'cypress' | 'jest';

export interface Results {
    codeSummary: string | null;
    normalizedPrd: NormalizedPrd | null;
    testPlan: TestPlan | null;
    testCode: string | null;
}

export interface Goal {
    id: string;
    description: string;
}

export interface UserStory {
    id: string;
    as_a: string;
    i_want: string;
    so_that: string;
}

export interface FunctionalRequirement {
    id: string;
    description: string;
}

export interface NonFunctionalRequirements {
    performance?: string;
    security?: string;
    usability?: string;
    reliability?: string;
}

export interface NormalizedPrd {
    app_name: string;
    overview: string;
    goals: Goal[];
    user_stories: UserStory[];
    functional_requirements: FunctionalRequirement[];
    non_functional_requirements: NonFunctionalRequirements;
}

export interface TestCase {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    steps: string[];
    expected_result: string;
}

export interface TestPlan {
    project_name: string;
    test_plan_version: string;
    test_cases: TestCase[];
}