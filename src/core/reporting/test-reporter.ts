import {
    Reporter,
    TestCase,
    TestResult,
    FullResult,
    FullConfig,
    Suite
} from "@playwright/test/reporter";

import * as fs from "fs";
import * as path from "path";

import { heal } from "@/api/healer/healer";
import { dbManager } from "../db/DBManager";
import { HealingRequest } from "@/types/healer";

export interface SerializedTestError {
    message?: string;
    stack?: string;
}

export interface SerializedTestResult {
    id: string;
    title: string;
    fullName: string;
    file: string;
    line: number;
    column: number;
    status: TestResult["status"];
    duration: number;
    errors: SerializedTestError[];
}

export interface SerializedRunSummary {
    status: FullResult["status"];
    startTime: string;
    duration: number;
    tests: SerializedTestResult[];
}

class TestReporter implements Reporter {
    private config!: FullConfig;

    private suite!: Suite;

    private tests: SerializedTestResult[] = [];

    private startTime!: number;

    private healingPromises: Promise<void>[] = [];

    onBegin(config: FullConfig, suite: Suite) {
        this.config = config;
        this.suite = suite;
        this.startTime = Date.now();
    }

    onTestEnd(test: TestCase, result: TestResult) {

        const relativeFile = path
            .relative(process.cwd(), test.location.file)
            .replace(/\\/g, "/");

        const errors: SerializedTestError[] = result.errors.map(err => ({
            message: err.message,
            stack: err.stack,
        }));

        const serializedTest: SerializedTestResult = {
            id: test.id,
            title: test.title,
            fullName: test.titlePath().filter(Boolean).join(" › "),
            file: relativeFile,
            line: test.location.line,
            column: test.location.column,
            status: result.status,
            duration: result.duration,
            errors,
        };

        this.tests.push(serializedTest);

        // Only heal failed tests
        if (serializedTest.status !== "failed" && serializedTest.status !== "timedOut") {
            return;
        }

        const healingPromise = (async () => {
            try {
                const locatorKey = "home.hero.shop_now_button";

                const locatorData = await dbManager.getLocatorData(locatorKey);

                if (!locatorData) {
                    console.warn(`[Healer] Locator not found: ${locatorKey}`);
                    return;
                }
                let pageUrl = "";

                let pageSource = "";

                const attachments = result.attachments || [];

                for (const attachment of attachments) {
                    if (attachment.name === "page-source" && attachment.path) {
                        pageSource = fs.readFileSync(attachment.path, "utf8");
                    }

                    if (attachment.name === "page-url" && attachment.path) {
                        pageUrl = fs.readFileSync(attachment.path, "utf8");
                    }
                }

                const healingRequest: HealingRequest = {
                    test: serializedTest,

                    failedLocator: locatorData.primary_locator,

                    locatorMetaData: {
                        [locatorData.key_name]:
                            locatorData.metadata
                    },

                    pageUrl,
                    pageSource,
                };

                const response = await heal(healingRequest);

                console.log("[Healer Response]", response);

            } catch (error) {
                console.error("[Healer] Failed:", error);
            }
        })();

        this.healingPromises.push(healingPromise);
    }

    async onEnd(result: FullResult) {
        // Wait for all healing requests to resolve before completing the run
        await Promise.all(this.healingPromises);

        const duration = Date.now() - this.startTime;

        const summary: SerializedRunSummary = {
            status: result.status,
            startTime: new Date(this.startTime).toISOString(),
            duration,
            tests: this.tests,
        };

        const outputDir = path.resolve(process.cwd(), "test-results");

        const outputPath = path.join(outputDir, "summary.json");

        try {

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), "utf8");

            console.log(`\n[TestReporter] Saved report to: ${outputPath}\n`);

        } catch (err) {
            console.error("[TestReporter] Failed to write summary:", err);
        }

        await dbManager.close();
    }
}

export default TestReporter;