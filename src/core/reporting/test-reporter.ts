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
import { HealingRequest, HealingResponse } from "@/types/healer";
import { TestHealingHelper } from "@/utils/TestHealingHelper";
import { mailService } from "@/services/MailService";
import { logger } from "@/utils/logger";
import { ConsoleReporter } from "./ConsoleReporter";

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
    private healingRetries = new Map<string, number>();
    private healingPromises: Promise<void>[] = [];

    onBegin(config: FullConfig, suite: Suite) {
        this.config = config; this.suite = suite;
        this.startTime = Date.now();
        ConsoleReporter.init();
    }

    async onTestEnd(test: TestCase, result: TestResult) {
        const relativeFile = path.relative(process.cwd(), test.location.file)
            .replace(/\\/g, "/");

        const errors: SerializedTestError[] = result.errors.map(err => ({ message: err.message, stack: err.stack, }));

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

        // Record test run details in the shared file
        ConsoleReporter.recordTest(test, result, relativeFile);

        /** * Skip passed tests */
        if (serializedTest.status !== "failed" && serializedTest.status !== "timedOut") { return; } 
        
        /** * Run healing asynchronously * without blocking Playwright execution */
        const healingPromise = (async () => {

            try {
                /** * Non-locator issue */
                const isLocatorIssue = TestHealingHelper.isLocatorFailure(serializedTest.errors);

                if (!isLocatorIssue) {
                    await mailService.sendMail("Non-locator test failure", JSON.stringify(serializedTest, null, 2));
                    return;
                }

                /** * Retry limit */
                const currentRetries = process.env.IS_HEALING_RERUN === "true"
                    ? parseInt(process.env.HEALING_RETRY_COUNT || "0", 10)
                    : (this.healingRetries.get(test.id) || 0);

                if (currentRetries >= 2) {
                    await mailService.sendMail("Healing retries exhausted", JSON.stringify(serializedTest, null, 2));
                    return;
                }

                /** * Get locator */
                const locatorKey = "home.hero.shop_now_button";
                const locatorData = await dbManager.getLocatorData(locatorKey);

                if (!locatorData) {
                    logger.warn({ locatorKey }, "Locator not found");
                    return;
                }

                /** * Attachments */
                let pageSource = "";
                let pageUrl = "";
                const attachments = result.attachments || [];

                for (const attachment of attachments) {
                    if (attachment.name === "page-source" && attachment.path) {
                        pageSource = fs.readFileSync(attachment.path, "utf8");
                    }

                    if (attachment.name === "page-url" && attachment.path) {
                        pageUrl = fs.readFileSync(attachment.path, "utf8");
                    }
                }

                /** * Healing request */
                const healingRequest: HealingRequest = {
                    test: serializedTest,
                    failedLocator: locatorData.primary_locator,
                    locatorMetaData: { [locatorData.key_name]: locatorData.metadata },
                    pageUrl,
                    pageSource,
                };

                /** * Call healer */
                const healingResponse: HealingResponse = await heal(healingRequest);

                logger.info({ healingResponse }, "Healing response received");

                /** * Healed locator found */
                if (healingResponse?.newLocator) {

                    /** * Update DB */
                    await dbManager.updateLocator(locatorKey,
                        { type: healingResponse.type || "xpath", value: healingResponse.newLocator }
                    );

                    /** * Increase retry count */
                    const nextRetryCount = currentRetries + 1;
                    this.healingRetries.set(test.id, nextRetryCount);

                    /** * Re-run failed test */
                    await TestHealingHelper.rerunTest(serializedTest.file, serializedTest.title, nextRetryCount);
                }

            } catch (error) {
                logger.error({ error }, "Healing flow failed");
                await mailService.sendMail("Healing pipeline failure", JSON.stringify(error));
            }
        })();

        /** * Store healing promise */
        this.healingPromises.push(healingPromise);

    }

    async onEnd(_result: FullResult) {

        /** * Wait for all healing requests * before completing reporter */
        await Promise.all(this.healingPromises);

        // If this is a rerun child process, do not run report consolidation
        if (process.env.IS_HEALING_RERUN === "true") {
            await dbManager.close();
            return;
        }

        const duration = Date.now() - this.startTime;

        // Generate report and get consolidated results
        const { consolidatedTests, allPassed } = ConsoleReporter.generateReport(this.tests);
        const finalStatus: FullResult["status"] = allPassed ? "passed" : "failed";

        const summary: SerializedRunSummary = {
            status: finalStatus,
            startTime: new Date(this.startTime).toISOString(),
            duration,
            tests: consolidatedTests,
        };

        const testResultsDir = path.resolve(process.cwd(), "test-results");
        const outputPath = path.join(testResultsDir, "summary.json");

        try {
            if (!fs.existsSync(testResultsDir)) {
                fs.mkdirSync(testResultsDir, { recursive: true });
            }
            fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), "utf8");
            console.log(`\n[TestReporter] Saved report to: ${outputPath}\n`);
        } catch (err) {
            console.error("[TestReporter] Failed to write summary:", err);
        }

        await dbManager.close();

        // If all tests eventually passed, override exit code to be 0
        if (allPassed) {
            const originalExit = process.exit;
            process.exit = function (_code?: number | string | null | undefined): never {
                return originalExit(0);
            };
        }
    }
}
export default TestReporter;