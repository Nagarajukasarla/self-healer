import * as fs from "fs";
import * as path from "path";
import type { SerializedRunSummary } from "../core/reporting/test-reporter.js";

const SUMMARY_PATH = path.resolve(process.cwd(), "test-results", "summary.json");

/**
 * Reads the latest test run execution summary details from the JSON file.
 * Returns null if the file does not exist or cannot be parsed.
 */
export function getTestResults(): SerializedRunSummary | null {
    try {
        if (!fs.existsSync(SUMMARY_PATH)) {
            return null;
        }
        const data = fs.readFileSync(SUMMARY_PATH, "utf8");
        return JSON.parse(data) as SerializedRunSummary;
    } catch {
        return null;
    }
}

/**
 * Clears the test execution summary JSON file if it exists.
 */
export function clearTestResults(): void {
    try {
        if (fs.existsSync(SUMMARY_PATH)) {
            fs.unlinkSync(SUMMARY_PATH);
        }
    } catch {
        // Ignore error if file doesn't exist or is locked
    }
}
