/**
 * Compresses an image file under a specified size limit (default 100KB)
 * using HTML5 Canvas for client-side processing.
 * 
 * @param {File} file - The original image file
 * @param {number} maxSizeKB - The target size limit in KB
 * @returns {Promise<File|Blob>} - The compressed File or the original if not an image
 */
export const compressImage = async (file, maxSizeKB = 100) => {
  // If not an image, we can't compress it this way
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // If already small enough, skip processing
  if (file.size <= maxSizeKB * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = reject;
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Step 1: Resizing
        // If the image is very large, downscale it to a reasonable maximum dimension
        // which drastically reduces file size before we even play with quality.
        const MAX_DIMENSION = 1200; 
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Step 2: Iterative Compression
        // We start with high quality and lower it until we hit the target size
        // or reach a minimum quality threshold (0.1)
        let quality = 0.8;
        
        const tryCompress = (q) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }

            // If blob is small enough OR we hit the minimum quality floor
            if (blob.size <= maxSizeKB * 1024 || q <= 0.1) {
              // Return as a File object to maintain compatibility with Supabase .upload()
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              // Reduce quality and try again
              tryCompress(q - 0.1);
            }
          }, 'image/jpeg', q);
        };

        tryCompress(quality);
      };
      
      img.onerror = reject;
    };
  });
};
