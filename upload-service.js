// upload-service.js
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from './cloudinary-config.js';

export async function uploadPdfToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar PDF para o Cloudinary.");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    name: data.original_filename,
    cloudinaryId: data.public_id
  };
}
