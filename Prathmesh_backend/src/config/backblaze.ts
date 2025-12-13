import B2 from 'backblaze-b2';
import dotenv from 'dotenv';

dotenv.config();

// Log environment variables for debugging
console.log('Backblaze B2 Configuration:');
console.log('- B2_ACCOUNT_ID:', process.env.B2_ACCOUNT_ID ? '*** (set)' : 'Not set');
console.log('- B2_APPLICATION_KEY:', process.env.B2_APPLICATION_KEY ? '*** (set)' : 'Not set');
console.log('- B2_BUCKET_ID:', process.env.B2_BUCKET_ID || 'Not set');
console.log('- B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME || 'Not set');
console.log('- B2_REGION:', process.env.B2_REGION || 'Not set (using default: us-west-004)');

// Initialize B2 client with retry options
const b2 = new B2({
  applicationKeyId: process.env.B2_ACCOUNT_ID || '',
  applicationKey: process.env.B2_APPLICATION_KEY || '',
  retry: {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 5000,
  }
});

// Bucket configuration
 const b2Config = {
  bucketId: process.env.B2_BUCKET_ID || '',
  bucketName: process.env.B2_BUCKET_NAME || '',
  region: process.env.B2_REGION || '',
  endpoint: process.env.B2_ENDPOINT ? `https://${process.env.B2_ENDPOINT}` : '',
  downloadUrl: process.env.B2_DOWNLOAD_URL || 'https://f005.backblazeb2.com'
};

// Track initialization state
let isInitialized = false;

// Initialize B2 connection with better error handling
const initializeB2 = async (maxRetries = 3, retryCount = 0): Promise<typeof b2> => {
  try {
    console.log(`🔌 Initializing Backblaze B2 connection (attempt ${retryCount + 1}/${maxRetries})...`);
    
    if (!process.env.B2_ACCOUNT_ID || !process.env.B2_APPLICATION_KEY) {
      throw new Error('Missing required Backblaze B2 credentials. Please check your .env file.');
    }
    
    const response = await b2.authorize();
    console.log('✅ Backblaze B2 connected successfully');
    console.log('🔑 Authorization details:', {
      accountId: response.data.accountId,
      apiUrl: response.data.apiUrl,
      downloadUrl: response.data.downloadUrl,
      allowed: response.data.allowed
    });
    
    isInitialized = true;
    return b2;
  } catch (error: any) {
    console.error('❌ Error initializing Backblaze B2:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.data || 'No response data',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers ? Object.keys(error.config.headers) : 'No headers',
      }
    });
    
    if (retryCount < maxRetries - 1) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return initializeB2(maxRetries, retryCount + 1);
    }
    
    throw new Error(`Failed to initialize Backblaze B2 after ${maxRetries} attempts: ${error.message}`);
  }
};

// Initialize on import
initializeB2().catch(err => {
  console.error('❌ Failed to initialize Backblaze B2:', err);
});

export { b2, b2Config, initializeB2, isInitialized };
