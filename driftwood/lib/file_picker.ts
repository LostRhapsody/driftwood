import { open } from "@tauri-apps/plugin-dialog";

/**
 * Open a file picker dialog and return the selected file path or array of paths.
 * @returns {Promise<string | string[]>}
 */
export default async function openFilePicker() {
	const selected = await open({
		multiple: false, // Set to true if you want to select multiple files
		filters: [
			{
				name: "Images",
				extensions: ["ico", "jpg", "jpeg", "png"],
			},
		],
	});

	if (selected) {
		console.log("Selected file(s):", selected);
        return selected;
	}

    console.log("No file selected");
    return null;
}
