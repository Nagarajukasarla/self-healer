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

    static async rerunTest(testFile: string, testTitle: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const child = spawn(
                "pnpm",
                [
                    "playwright",
                    "test",
                    testFile,
                    "--grep",
                    testTitle
                ],
                {
                    stdio: "inherit",
                    shell: true,
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