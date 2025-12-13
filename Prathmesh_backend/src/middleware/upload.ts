import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { b2, b2Config } from '../config/backblaze';
import { v4 as uuidv4 } from 'uuid';

// Extend the Express Request type to include the file property
declare module 'express-serve-static-core' {
  interface Request {
    file?: Express.Multer.File & { buffer: Buffer };
  }
}

// Configure multer to use memory storage with limits
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};


// Configure multer with increased limits
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
    fields: 20,
    headerPairs: 20
  }
});

export const uploadBlogImage = (req: Request, res: Response, next: NextFunction) => {
  const uploadMiddleware = upload.single('image');
  
  uploadMiddleware(req, res, async (err: any) => {
    if (err) {
      console.error('File upload error:', {
        message: err.message,
        code: err.code,
        field: err.field,
        storageErrors: err.storageErrors
      });

      let errorMessage = 'Error uploading file';
      let statusCode = 400;

      if (err.code === 'LIMIT_FILE_SIZE') {
        errorMessage = 'File size exceeds the 10MB limit. Please choose a smaller file.';
        statusCode = 413;
      } else if (err.message === 'Unexpected field') {
        errorMessage = 'Invalid file field name. Please use \'image\' as the field name.';
      }

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // If no file was uploaded, just continue (make image optional)
    if (!req.file) {
      return next();
    }

    console.log('Starting file upload to Backblaze B2...', {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    try {
      await b2.authorize();
      
      const { data: uploadUrlData } = await b2.getUploadUrl({
        bucketId: b2Config.bucketId
      });
      
      const fileExt = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `images/${uuidv4()}.${fileExt}`;
      
      const response = await b2.uploadFile({
        uploadUrl: uploadUrlData.uploadUrl,
        uploadAuthToken: uploadUrlData.authorizationToken,
        fileName: fileName,
        data: req.file.buffer,
        mime: req.file.mimetype,
        onUploadProgress: (event: { loaded: number; total: number }) => {
          const percent = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${percent}%`);
        }
      });

      // After successful upload to B2
      const fileId = response.data.fileId;
      const uploadedFileName = response.data.fileName;
      
      console.log('File uploaded successfully to Backblaze B2:', {
        fileId: fileId,
        fileName: uploadedFileName
      });

      // Use your backend URL instead of direct B2 URL
      const backendUrl = process.env.BACKEND_URL;
      const publicUrl = `${backendUrl}/api/files/${uploadedFileName}`;
      req.body.imageUrl = publicUrl;

      return next();
    } catch (error: any) {
      console.error('Backblaze B2 Upload Error:', error);

      let errorMessage = 'Failed to upload image to storage';
      let statusCode = 500;

      if (error?.response?.data?.code === 'storage_quota_exceeded') {
        errorMessage = 'Storage quota exceeded. Please contact support.';
        statusCode = 507;
      } else if (error?.code === 'ENOTFOUND') {
        errorMessage = 'Cannot connect to storage service. Please check your internet connection.';
        statusCode = 503;
      } else if (error?.status === 401) {
        errorMessage = 'Storage authentication failed. Please check your B2 credentials.';
      }

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};

// Serve files directly from Backblaze B2 using signed URLs
export const serveUploadedFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    console.log('Generating download URL for file:', filename);
    
    // Generate a signed URL that's valid for 1 hour
    const authResponse = await b2.getDownloadAuthorization({
      bucketId: b2Config.bucketId,
      fileNamePrefix: filename,
      validDurationInSeconds: 3600,
      b2ContentDisposition: `inline; filename="${filename}"`
    });
    
    // Construct the download URL
    const downloadUrl = `${b2Config.downloadUrl}/file/${b2Config.bucketName}/${filename}?Authorization=${encodeURIComponent(authResponse.data.authorizationToken)}`;
    
    console.log('Redirecting to signed URL');
    res.redirect(downloadUrl);
    
  } catch (error: any) {
    console.error('Error generating download URL:', {
      message: error?.message,
      code: error?.code,
      status: error?.status
    });
    
    res.status(500).json({
      success: false,
      message: 'Error serving file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};