import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges tailwind classes together
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * validates the data contains a list of fields
 */
export function validateFields(
	data: Record<string, unknown>,
	requiredFields: string[],
): boolean {
	return requiredFields.every((field) => field in data);
}

/**
 * Parses and validates a response
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
