import * as FileSystem from "expo-file-system";

export interface UploadImageResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: any[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  original_filename: string;
}

const uploadImage = async (imageUri: string): Promise<string | null> => {
  try {
    const cloudName = "dnjaidxgs";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();

    // Read the image as a base64 string
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Append image data and preset to formData
    formData.append("file", `data:image/jpeg;base64,${base64Image}`);
    formData.append("upload_preset", "ml_default");

    // Upload to Cloudinary
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const result: UploadImageResponse = await response.json();

    if (!result.secure_url) {
      throw new Error("Failed to upload image to Cloudinary.");
    }

    return result.secure_url;
  } catch (error: any) {
    console.error("Upload Image Error:", error);
    return null;
  }
};

export default uploadImage;
