import { Reporter, TestCase, TestResult, FullResult, FullConfig, Suite } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

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

    onBegin(config: FullConfig, suite: Suite) {
        this.config = config;
        this.suite = suite;
        this.startTime = Date.now();
    }

    onTestEnd(test: TestCase, result: TestResult) {
        // Helper to get relative file path for clean logging/reporting
        const relativeFile = path.relative(process.cwd(), test.location.file).replace(/\\/g, "/");

        // Map errors to simple JSON structures with stack traces
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
    }

    async onEnd(result: FullResult) {
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
            console.log(`\n[TestReporter] Saved test run execution details to: ${outputPath}\n`);
        } catch (err) {
            console.error("[TestReporter] Failed to write test run summary file:", err);
        }
    }
}

export default TestReporter;
