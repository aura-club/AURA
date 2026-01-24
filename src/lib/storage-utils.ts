/**
 * Uploads a file to ImgBB and returns the display URL.
 * Note: Free tier of ImgBB doesn't support folder organization via API, 
 * so the 'folder' parameter is ignored but kept for compatibility.
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
    const ALUMNI_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!ALUMNI_KEY) {
        console.error("ImplBB API Key is missing. Please add NEXT_PUBLIC_IMGBB_API_KEY to your .env file.");
        // Fallback to placeholder to prevent app crash, but warn user
        return "https://placehold.co/600x400?text=Missing+API+Key";
    }

    const formData = new FormData();
    formData.append("image", file);

    console.log("Starting ImgBB upload for:", file.name);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${ALUMNI_KEY}`, {
            method: "POST",
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error?.message || "Upload failed");
        }

        console.log("ImgBB upload success:", result.data.url);
        return result.data.url;
    } catch (error: any) {
        console.error("ImgBB Upload Error:", error);
        if (error.name === 'AbortError') {
            throw new Error("Upload timed out. Please check your internet connection.");
        }
        throw new Error(error.message || "Upload failed");
    }
}
