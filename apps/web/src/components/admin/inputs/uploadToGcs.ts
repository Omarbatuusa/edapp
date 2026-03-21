import { authFetch } from '@/lib/authFetch';

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
        const err = await urlRes.json().catch(() => ({}));
        throw new Error((err as any).message || 'Failed to get upload URL');
    }
    const { uploadUrl, objectKey } = await urlRes.json() as { uploadUrl: string; objectKey: string };

    // 2. PUT file directly to GCS signed URL (no auth — signed URL already has credentials)
    const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
    });
    if (!putRes.ok) throw new Error('Upload failed. Please try again.');

    // 3. Fetch a short-lived signed read URL for preview (needs auth)
    const readRes = await authFetch(`/v1/storage/read-url?key=${encodeURIComponent(objectKey)}`);
    const { readUrl } = readRes.ok ? await readRes.json() as { readUrl: string } : { readUrl: '' };

    return { objectKey, previewUrl: readUrl };
}
