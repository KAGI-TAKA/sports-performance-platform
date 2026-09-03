/**
 * Helper to compress and convert any chosen image file from device (PC/Mobile)
 * into a lightweight optimized Base64 Data URI (< 250KB) using HTML Canvas.
 */
export async function processImageFile(file: File, maxSize = 300): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Hanya file format gambar (JPG, PNG, WEBP, GIF) yang diizinkan.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran file foto maksimal 5MB.");
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Gagal menginisialisasi canvas untuk kompresi foto."));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);

        const base64 = canvas.toDataURL("image/jpeg", 0.88);
        resolve(base64);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Format file gambar rusak atau tidak dapat dibaca."));
    };
  });
}
