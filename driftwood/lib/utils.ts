import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { open } from "@tauri-apps/api/shell";

/**
 * Merges tailwind classes together
 * @param inputs - the classes to merge
 * @returns the merged classes
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * validates the data contains a list of fields
 * @param data - the data to validate
 * @param requiredFields - the fields to validate
 * @returns true if all fields are
 */
export function validateFields(
	data: Record<string, unknown>,
	requiredFields: string[],
): boolean {
	return requiredFields.every((field) => field in data);
}

/**
 * Parses and validates a response
 * @param response - the response to parse
 * @returns the parsed response
 * @throws error if the response is invalid
 */
export function processResponse(response: unknown): boolean {
	if (!response || typeof response !== "object") {
		console.error("Invalid response");
		return false;
	}

	try {
		const data = JSON.parse(JSON.stringify(response));

		if (!validateFields(data, ["success", "title", "description", "name"])) {
			console.error("Missing required fields");
			return false;
		}

		return true;
	} catch (error) {
		console.error("Error processing response:", error);
		return false;
	}
}

/**
 * Opens the driftwood wiki in the user's default browser
 * @param path - The path to the page you want to open
 */
export function openWiki(path: string) {
	open(`https://wiki.driftwoodapp.com/${path}`);
}