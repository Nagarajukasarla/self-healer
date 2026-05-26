export interface TestDetails {
    id: string;
    name: string;
}

export interface Locator {
    id: string; // DB_ID
    type: string; // CSS, XPath, TEXT, ID, NAME, etc.
    value: string;
    tag: string;
}

export interface LocatorMetaData {
    predecessors: {
        first: string; // parent tag
        second?: string;
        third?: string;
    }
    siblings?: {
        left?: string[]; // immediate left siblings (all)
        right?: string[]; // immediate right siblings (all)
    }
}

export interface HealingRequest {
    test: TestDetails
    failedLocator: Locator;
    locatorMetaData: LocatorMetaData;
    pageUrl: string;
}

export interface HealingResponse {
    newLocator?: string;
    confidence?: number;
    strategy?: string;
}