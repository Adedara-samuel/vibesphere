const CLOUD_NAME = 'vibesphere'; // Replace with your actual cloud name
const UPLOAD_PRESET = 'vibesphere_uploads'; // Create this preset in Cloudinary dashboard

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('api_key', 'wrCRCkrB45thf3a2ad_1EoIwKT0');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

export const getCloudinaryUrl = (publicId: string, options: any = {}) => {
  const { width, height, crop = 'fill', quality = 'auto' } = options;
  let url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`;

  if (width) url += `w_${width}/`;
  if (height) url += `h_${height}/`;
  if (crop) url += `c_${crop}/`;
  if (quality) url += `q_${quality}/`;

  url += `${publicId}`;
  return url;
};