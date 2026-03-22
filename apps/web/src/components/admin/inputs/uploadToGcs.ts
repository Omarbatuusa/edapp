import { authFetch } from '@/lib/authFetch';

/**
 * Upload a file to GCS via the two-step signed URL flow.
 *
 * Falls back to the direct proxy upload path if signed URL generation fails
 * (e.g. the VM service account lacks iam.serviceAccountTokenCreator).
 */
export async function uploadToGcs(
    file: File,
    category: string = 'logos',
): Promise<{ objectKey: string; previewUrl: string }> {
    // 1. Get signed upload URL from backend (needs auth)
    const urlRes = await authFetch('/v1/storage/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, filename: file.name, contentType: file.type }),
    });

    if (!urlRes.ok) {
        if (urlRes.status === 401) {
            throw new Error('Your session has expired. Please refresh the page and log in again.');
        }
        // Signed URL generation failed — storage not configured or VM lacks
        // iam.serviceAccountTokenCreator. Fall back to direct proxy upload which
        // writes to GCS using the backend's ADC credentials (no signing required).
        return uploadViaDirect(file, category);
    }

    const { uploadUrl, objectKey } = await urlRes.json() as { uploadUrl: string; objectKey: string };

    // 2. PUT file directly to GCS signed URL (no auth — signed URL has embedded credentials)
    const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
    });
    if (!putRes.ok) throw new Error('Upload failed. Please try again.');

    // 3. Fetch a short-lived signed read URL for preview (needs auth).
    //    Falls back to the public serve endpoint if signed read URLs are also unavailable.
    const readRes = await authFetch(`/v1/storage/read-url?key=${encodeURIComponent(objectKey)}`);
    if (readRes.ok) {
        const { readUrl } = await readRes.json() as { readUrl: string };
        return { objectKey, previewUrl: readUrl || toServeUrl(objectKey) };
    }
    return { objectKey, previewUrl: toServeUrl(objectKey) };
}

/**
 * Fallback: upload file via backend proxy (POST multipart/form-data).
 * Backend uses ADC credentials to write directly to GCS — no URL signing required.
 */
async function uploadViaDirect(
    file: File,
    category: string,
): Promise<{ objectKey: string; previewUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    // Do NOT set Content-Type — browser sets it automatically with the correct multipart boundary.
    const res = await authFetch('/v1/storage/upload', { method: 'POST', body: formData });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error('Your session has expired. Please refresh the page and log in again.');
        }
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || 'Upload failed. Please try again.');
    }

    const { objectKey } = await res.json();
    return { objectKey, previewUrl: toServeUrl(objectKey) };
}

/**
 * Build a serve URL for immediate preview.
 * Served publicly for logos, covers, and avatars — no auth required.
 */
function toServeUrl(objectKey: string): string {
    return `/v1/storage/serve?key=${encodeURIComponent(objectKey)}`;
}
