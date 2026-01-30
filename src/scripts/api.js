/**
 * Open file dialog and read binary file
 * @returns {Promise<{data: Uint8Array, name: string, path: string} | null>}
 */
export async function openFile() {
  if (!window.electronAPI) {
    throw new Error("Not running in Electron");
  }

  const result = await window.electronAPI.openFile();

  if (result.canceled) {
    return null; // User cancelled
  }

  if (result.error) {
    throw new Error(`Failed to open file: ${result.error}`);
  }

  return {
    data: new Uint8Array(result.data),
    name: result.name,
    path: result.path,
  };
}

/**
 * Save blob to file with dialog
 * @param {Blob} blob - Data to save
 * @param {string} defaultName - Default filename
 * @returns {Promise<{name: string, path: string} | null>}
 */
export async function saveFile(blob, defaultName = "untitled") {
  if (!window.electronAPI) {
    throw new Error("Not running in Electron");
  }

  // Convert Blob to ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const result = await window.electronAPI.saveFile(
    Array.from(uint8Array),
    defaultName
  );

  if (result.canceled) {
    return null; // User cancelled
  }

  if (result.error) {
    throw new Error(`Failed to save file: ${result.error}`);
  }

  return {
    name: result.name,
    path: result.path,
  };
}
