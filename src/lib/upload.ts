import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

export async function uploadImage(file: File): Promise<string> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };
  
  let uploadData: File | Blob = file;
  try {
    uploadData = await imageCompression(file, options);
  } catch (compErr) {
    console.warn('Image compression failed, falling back to original file:', compErr);
    uploadData = file;
  }
  
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('sdg-youth-images')
      .upload(filePath, uploadData, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('sdg-youth-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
