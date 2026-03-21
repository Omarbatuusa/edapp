import { authFetch } from '@/lib/authFetch';

/**
 * Upload a file directly to GCS via backend proxy.
 * Avoids signed-URL generation (which requires iam.serviceAccountTokenCreator on the VM).
 * The backend receives the file as multipart/form-data and writes it with ADC credentials.
 */
export async function uploadDirect(
    file: File,
    category: string = 'logos',
): Promise<{ objectKey: string; serveUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    // Do NOT set Content-Type — browser sets it automatically with the correct boundary for multipart
    const res = await authFetch('/v1/storage/upload', {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || 'Upload failed');
    }

    const { objectKey } = await res.json();
    const serveUrl = `/v1/storage/serve?key=${encodeURIComponent(objectKey)}`;
    return { objectKey, serveUrl };
}
