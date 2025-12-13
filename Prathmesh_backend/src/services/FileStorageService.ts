import { v4 as uuidv4 } from 'uuid';
import { b2, b2Config } from '../config/backblaze';

class FileStorageService {
  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    try {
      console.log('Attempting to authorize with Backblaze B2...');
      await b2.authorize();
      console.log('Authorization successful');
      
      // Get upload URL
      console.log('Getting upload URL for bucket:', b2Config.bucketId);
      const { data: uploadUrlData } = await b2.getUploadUrl({
        bucketId: b2Config.bucketId
      });
      console.log('Got upload URL');

      // Generate unique file name
      const fileName = `${folder}/${uuidv4()}-${file.originalname.replace(/[^\w\d.-]/g, '_')}`;
      console.log('Generated file name:', fileName);
      
      // Upload file
      console.log('Starting file upload...');
      const response = await b2.uploadFile({
        uploadUrl: uploadUrlData.uploadUrl,
        uploadAuthToken: uploadUrlData.authorizationToken,
        fileName: fileName,
        data: file.buffer,
        mime: file.mimetype,
        onUploadProgress: (event: any) => {
          console.log(`Upload progress: ${event.loaded} bytes transferred`);
        }
      });
      console.log('File upload successful:', response.data);

      // Return public URL in the format: https://f005.backblazeb2.com/file/prathmeshroadlines/filename.ext
      const publicUrl = `https://f005.backblazeb2.com/file/prathmeshroadlines/${fileName.split('/').pop()}`;
      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Detailed error uploading to Backblaze B2:', {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? Object.keys(error.config.headers) : null,
          data: error.config?.data ? 'Data exists' : 'No data'
        }
      });
      throw new Error(`Failed to upload file: ${error.message || 'Unknown error'}`);
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      await b2.authorize();
      
      // Extract file name from URL
      const fileName = fileUrl.split('/').slice(4).join('/');
      
      // Get file ID first
      const { data: files } = await b2.listFileNames({
        bucketId: b2Config.bucketId,
        startFileName: fileName,
        maxFileCount: 1,
        prefix: fileName.split('/').slice(0, -1).join('/') || '',
        delimiter: ''
      });

      if (!files.files || files.files.length === 0) {
        throw new Error('File not found');
      }

      const file = files.files.find((f: { fileName: string; fileId: string }) => f.fileName === fileName);
      if (!file) {
        throw new Error('File not found');
      }
      
      // Delete the file
      await b2.deleteFileVersion({
        fileId: file.fileId,
        fileName: fileName
      });
    } catch (error) {
      console.error('Error deleting file from Backblaze B2:', error);
      throw new Error('Failed to delete file');
    }
  }
}

export default new FileStorageService();
