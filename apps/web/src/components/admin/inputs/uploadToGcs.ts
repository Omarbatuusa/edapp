export async function uploadToGcs(
    file: File,
    category: 'logos' | 'attachments' = 'logos',
): Promise<{ objectKey: string; previewUrl: string }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // 1. Get signed upload URL from backend
    const urlRes = await fetch('/v1/storage/upload-url', {
        method: 'POST',
        headers,
        body: JSON.stringify({ category, filename: file.name, contentType: file.type }),
    });
    if (!urlRes.ok) {
        const err = await urlRes.json().catch(() => ({}));
        throw new Error((err as any).message || 'Failed to get upload URL');
    }
    const { uploadUrl, objectKey } = await urlRes.json() as { uploadUrl: string; objectKey: string };

    // 2. PUT file directly to GCS signed URL
    const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
    });
    if (!putRes.ok) throw new Error('Upload failed. Please try again.');

    // 3. Fetch a short-lived signed read URL for preview
    const readHeaders: Record<string, string> = {};
    if (token) readHeaders['Authorization'] = `Bearer ${token}`;
    const readRes = await fetch(`/v1/storage/read-url?key=${encodeURIComponent(objectKey)}`, { headers: readHeaders });
    const { readUrl } = readRes.ok ? await readRes.json() as { readUrl: string } : { readUrl: '' };

    return { objectKey, previewUrl: readUrl };
}
