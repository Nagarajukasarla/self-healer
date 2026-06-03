import { spawn } from "child_process";
import { SerializedTestError } from "@/core/reporting/test-reporter";

export class TestHealingHelper {
    static isLocatorFailure(errors: SerializedTestError[]): boolean {
        return errors.some(error => {
            const message = error.message || "";
            return (
                message.includes("locator") ||
                message.includes("toBeVisible") ||
                message.includes("waiting for selector") ||
                message.includes("element not found") ||
                message.includes("timeout")
            );
        });
    }

    static async rerunTest(testFile: string, testTitle: string, currentRetries: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const child = spawn(
                "pnpm",
                [
                    "playwright",
                    "test",
                    testFile,
                    "--grep",
                    `"${testTitle}"`
                ],
                {
                    stdio: "inherit",
                    shell: true,
                    env: {
                        ...process.env,
                        IS_HEALING_RERUN: "true",
                        HEALING_RETRY_COUNT: String(currentRetries)
                    }
                }
            );

            child.on("close", (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(
                        new Error(
                            `Re-run failed with exit code ${code}`
                        )
                    );
                }
            });
        });
    }
}