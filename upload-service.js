// upload-service.js
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME  } from './cloudinary-config.js';

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

// Adicione no upload-service.js
export async function deletePdfFromCloudinary(publicId) {
  if (!publicId) return;

  const CLOUDINARY_DELETE_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/delete_by_token`;
  
  try {
    const response = await fetch(CLOUDINARY_DELETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: publicId
      })
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir PDF do Cloudinary.");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao excluir do Cloudinary:", error);
    throw error;
  }
}
