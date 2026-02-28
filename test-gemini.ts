import * as dotenv from "dotenv";
dotenv.config();

import { tailorResume } from "./src/services/gemini";
import { initialResumeData } from "./src/data/initialResume";

async function main() {
    console.log("Starting test-tailor...");
    const fakeJobDescription = "We are looking for a Senior React Developer with deep expertise in Next.js, AI wrappers, and writing fast web interfaces.";
    try {
        console.log("Calling tailorResume...");
        const result = await tailorResume(initialResumeData, fakeJobDescription);
        console.log("Success! Result keys:", Object.keys(result));
        console.log("Result summary of changes:", result.summaryOfChanges);
    } catch (err) {
        console.error("Error tailoring resume:", err);
    }
}

main();
