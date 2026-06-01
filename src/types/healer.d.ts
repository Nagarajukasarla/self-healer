import { SerializedTestResult } from "@/core/reporting/test-reporter";
import { LocatorMetadata, LocatorStrategy } from "./locator";

export interface HealingRequest {
    test: SerializedTestResult;

    failedLocator: LocatorStrategy;

    locatorMetaData: Record<string, LocatorMetadata>;

    pageUrl: string;

    pageSource: string;
}


export interface HealingResponse {
    type?: string;
    newLocator?: string;
    confidence?: number;
    strategy?: string;
}