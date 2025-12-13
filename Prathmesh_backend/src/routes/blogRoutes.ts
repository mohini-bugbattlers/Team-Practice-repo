import { Router } from 'express';
import { 
  BlogController, 
  blogQueryValidation, 
  createBlogValidation, 
  updateBlogValidation 
} from '../controllers/BlogController';
import { uploadBlogImage, serveUploadedFile } from '../middleware/upload';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../interfaces';

const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error: any) => error.msg)
    } as ApiResponse);
  }
  next();
};

const router = Router();

// Public routes - no authentication required
router.get('/', blogQueryValidation, validateRequest, BlogController.getAllBlogs);
router.get('/:slug', BlogController.getBlogBySlug);
router.get('/categories/all', BlogController.getCategories);

// Admin-only routes - require authentication
// These will be protected in server.ts
router.post('/', 
  uploadBlogImage, 
  createBlogValidation, 
  validateRequest, 
  BlogController.createBlog
);

router.put('/:id', 
  uploadBlogImage, 
  updateBlogValidation, 
  validateRequest, 
  BlogController.updateBlog
);
router.delete('/:id', BlogController.deleteBlog);



export default router;
