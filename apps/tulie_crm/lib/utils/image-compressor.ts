/**
 * Client-side image compression utility
 * Uses Canvas API to resize and compress images before upload
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DIMENSION = 1920 // Max width or height
const COMPRESSION_QUALITY = 0.8

export interface CompressResult {
    blob: Blob
    width: number
    height: number
    originalSize: number
    compressedSize: number
}

/**
 * Validates file size (max 5MB)
 */
export function validateFileSize(file: File | Blob): boolean {
    return file.size <= MAX_FILE_SIZE
}

/**
 * Compress an image file using Canvas API
 * - Resizes to max 1920px (largest dimension)
 * - Converts to WebP (fallback JPEG) at quality 0.8
 * - Validates max 5MB input
 */
export async function compressImage(file: File | Blob): Promise<CompressResult> {
    const originalSize = file.size

    if (originalSize > MAX_FILE_SIZE) {
        throw new Error(`Ảnh vượt quá ${MAX_FILE_SIZE / 1024 / 1024}MB. Vui lòng chọn ảnh nhỏ hơn.`)
    }

    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(url)

            let { width, height } = img

            // Resize if exceeds max dimension
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                if (width > height) {
                    height = Math.round((height * MAX_DIMENSION) / width)
                    width = MAX_DIMENSION
                } else {
                    width = Math.round((width * MAX_DIMENSION) / height)
                    height = MAX_DIMENSION
                }
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('Canvas context not available'))
                return
            }

            ctx.drawImage(img, 0, 0, width, height)

            // Try WebP first, fallback to JPEG
            const tryFormat = (format: string, quality: number): Promise<Blob> => {
                return new Promise((res, rej) => {
                    canvas.toBlob(
                        (blob) => {
                            if (blob) res(blob)
                            else rej(new Error(`Failed to compress as ${format}`))
                        },
                        format,
                        quality
                    )
                })
            }

            tryFormat('image/webp', COMPRESSION_QUALITY)
                .catch(() => tryFormat('image/jpeg', COMPRESSION_QUALITY))
                .then((blob) => {
                    resolve({
                        blob,
                        width,
                        height,
                        originalSize,
                        compressedSize: blob.size,
                    })
                })
                .catch(reject)
        }

        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Không thể đọc file ảnh'))
        }

        img.src = url
    })
}

/**
 * Convert a clipboard paste event's image to a File object
 */
export function getImageFromClipboard(e: ClipboardEvent | React.ClipboardEvent): File | null {
    const items = e.clipboardData?.items
    if (!items) return null

    for (const item of items) {
        if (item.type.startsWith('image/')) {
            return item.getAsFile()
        }
    }
    return null
}

/**
 * Generate a unique filename for uploads
 */
export function generateFileName(originalName?: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = originalName?.split('.').pop() || 'webp'
    return `feedback-${timestamp}-${random}.${ext}`
}
