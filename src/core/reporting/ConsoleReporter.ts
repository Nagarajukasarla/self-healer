import { TestCase, TestResult } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";
import type { SerializedTestResult, SerializedTestError } from "./test-reporter";

export interface TestRunRecord {
    id: string;
    title: string;
    fullName: string;
    file: string;
    runType: "first" | "rerun";
    status: TestResult["status"];
    duration: number;
    errors: SerializedTestError[];
    timestamp: number;
}

export interface ConsoleReportSummary {
    fullName: string;
    firstStatus: string;
    rerunStatus: string;
    finalStatus: string;
}

export class ConsoleReporter {
    private static getRunStatePath(): string {
        return path.resolve(process.cwd(), ".healer-state", `run-state-${process.pid}.json`);
    }

    private static getRunState(): TestRunRecord[] {
        const runStatePath = this.getRunStatePath();
        if (!fs.existsSync(runStatePath)) {
            return [];
        }
        try {
            return JSON.parse(fs.readFileSync(runStatePath, "utf8"));
        } catch {
            return [];
        }
    }

    private static saveRunState(state: TestRunRecord[]) {
        const outputDir = path.resolve(process.cwd(), ".healer-state");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const runStatePath = this.getRunStatePath();
        fs.writeFileSync(runStatePath, JSON.stringify(state, null, 2), "utf8");
    }

    static init() {
        // Clear .healer-state files at the start of the parent run
        if (process.env.IS_HEALING_RERUN !== "true") {
            const outputDir = path.resolve(process.cwd(), ".healer-state");
            if (fs.existsSync(outputDir)) {
                try {
                    const files = fs.readdirSync(outputDir);
                    for (const file of files) {
                        if (file.startsWith("run-state-") && file.endsWith(".json")) {
                            fs.unlinkSync(path.join(outputDir, file));
                        }
                    }
                } catch {
                    // Ignore
                }
            }
        }
    }

    static recordTest(test: TestCase, result: TestResult, relativeFile: string) {
        const runType = process.env.IS_HEALING_RERUN === "true" ? "rerun" : "first";
        const errors: SerializedTestError[] = result.errors.map(err => ({ message: err.message, stack: err.stack, }));

        const record: TestRunRecord = {
            id: test.id,
            title: test.title,
            fullName: test.titlePath().filter(Boolean).join(" › "),
            file: relativeFile,
            runType,
            status: result.status,
            duration: result.duration,
            errors,
            timestamp: Date.now(),
        };

        const state = this.getRunState();
        state.push(record);
        this.saveRunState(state);
    }

    static generateReport(parentTests: SerializedTestResult[]): {
        consolidatedTests: SerializedTestResult[];
        allPassed: boolean;
    } {
        // Consolidate run states from all files
        const outputDir = path.resolve(process.cwd(), ".healer-state");
        const state: TestRunRecord[] = [];
        const stateFiles: string[] = [];

        if (fs.existsSync(outputDir)) {
            try {
                const files = fs.readdirSync(outputDir);
                for (const file of files) {
                    if (file.startsWith("run-state-") && file.endsWith(".json")) {
                        const filePath = path.join(outputDir, file);
                        stateFiles.push(filePath);
                        try {
                            const content = fs.readFileSync(filePath, "utf8");
                            const records = JSON.parse(content);
                            if (Array.isArray(records)) {
                                state.push(...records);
                            }
                        } catch {
                            // Ignore
                        }
                    }
                }
            } catch {
                // Ignore
            }
        }

        // Sort state records chronologically
        state.sort((a, b) => a.timestamp - b.timestamp);

        const uniqueIds: string[] = [];
        const recordsById = new Map<string, TestRunRecord[]>();

        for (const record of state) {
            if (!recordsById.has(record.id)) {
                uniqueIds.push(record.id);
                recordsById.set(record.id, []);
            }
            recordsById.get(record.id)!.push(record);
        }

        const testSummaries: ConsoleReportSummary[] = [];
        const consolidatedTests: SerializedTestResult[] = [];

        for (const id of uniqueIds) {
            const records = recordsById.get(id)!;
            const firstRecord = records.find(r => r.runType === "first") || records[0];
            const rerunRecords = records.filter(r => r.runType === "rerun");
            const lastRecord = records[records.length - 1];

            const firstStatus = firstRecord.status;
            const rerunStatus = rerunRecords.length > 0 ? lastRecord.status : "N/A";
            const finalStatus = lastRecord.status;

            testSummaries.push({
                fullName: lastRecord.fullName,
                firstStatus,
                rerunStatus,
                finalStatus
            });

            // Calculate total duration across all runs of this test
            const totalTestDuration = records.reduce((sum, r) => sum + r.duration, 0);

            // Reconstruct SerializedTestResult
            const originalTest = parentTests.find(t => t.id === id) || {
                id,
                title: lastRecord.title,
                fullName: lastRecord.fullName,
                file: lastRecord.file,
                line: 0,
                column: 0,
                status: lastRecord.status,
                duration: totalTestDuration,
                errors: lastRecord.errors
            };

            consolidatedTests.push({
                ...originalTest,
                status: finalStatus,
                duration: totalTestDuration,
                errors: finalStatus === "passed" ? [] : lastRecord.errors
            });
        }

        // Print table to console
        this.printTable(testSummaries);

        // Determine final overall status
        const allPassed = uniqueIds.every(id => {
            const records = recordsById.get(id)!;
            const lastRecord = records[records.length - 1];
            return lastRecord.status === "passed" || lastRecord.status === "skipped";
        });

        // Delete temp run-state files and directory
        for (const filePath of stateFiles) {
            try {
                fs.unlinkSync(filePath);
            } catch {
                // Ignore
            }
        }
        try {
            fs.rmdirSync(outputDir);
        } catch {
            // Ignore
        }

        return {
            consolidatedTests,
            allPassed
        };
    }

    static printTable(testSummaries: ConsoleReportSummary[]) {
        const nameHeader = "Test Name";
        const run1Header = "First Run";
        const rerunHeader = "Rerun";
        const finalHeader = "Final Status";

        let maxNameLen = nameHeader.length;
        for (const s of testSummaries) {
            if (s.fullName.length > maxNameLen) {
                maxNameLen = s.fullName.length;
            }
        }
        const displayMaxNameLen = Math.min(maxNameLen, 80);

        const padName = (name: string) => {
            let display = name;
            if (name.length > displayMaxNameLen) {
                display = name.substring(0, displayMaxNameLen - 3) + "...";
            }
            return display.padEnd(displayMaxNameLen);
        };

        const separator = `+-${"-".repeat(displayMaxNameLen)}-+-${"-".repeat(12)}-+-${"-".repeat(12)}-+-${"-".repeat(14)}-+`;

        console.log("\n\x1b[1m=====================================================================================\x1b[0m");
        console.log("\x1b[1m\x1b[36m                           SELF-HEALING TEST RUN REPORT                              \x1b[0m");
        console.log("\x1b[1m=====================================================================================\x1b[0m");
        console.log(separator);
        console.log(`| \x1b[1m${padName(nameHeader)}\x1b[0m | \x1b[1m${run1Header.padEnd(12)}\x1b[0m | \x1b[1m${rerunHeader.padEnd(12)}\x1b[0m | \x1b[1m${finalHeader.padEnd(14)}\x1b[0m |`);
        console.log(separator);

        for (const s of testSummaries) {
            console.log(`| ${padName(s.fullName)} | ${this.padAndColorStatus(s.firstStatus, 12)} | ${this.padAndColorStatus(s.rerunStatus, 12)} | ${this.padAndColorStatus(s.finalStatus, 14)} |`);
        }
        console.log(separator);
        console.log("\x1b[1m=====================================================================================\x1b[0m\n");
    }

    private static padAndColorStatus(status: string, width: number): string {
        const upper = status.toUpperCase();
        const padded = upper.padEnd(width);
        if (upper === "PASSED" || upper === "PASS") {
            return `\x1b[32m\x1b[1m${padded}\x1b[0m`; // Bold Green
        }
        if (upper === "FAILED" || upper === "TIMEDOUT" || upper === "FAIL") {
            return `\x1b[31m\x1b[1m${padded}\x1b[0m`; // Bold Red
        }
        if (upper === "N/A") {
            return `\x1b[90m${padded}\x1b[0m`; // Grey
        }
        return padded;
    }
}
