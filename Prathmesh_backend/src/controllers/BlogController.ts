import { Request, Response } from 'express';
import { query, body, validationResult } from 'express-validator';
import { BlogService } from '../services/BlogService';
import { ApiResponse, BlogQuery } from '../interfaces';
import { uploadBlogImage } from '../middleware/upload';

const blogService = new BlogService();

// Blog validation rules
export const blogQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('search').optional().isString().withMessage('Search term must be a string')
];

export const createBlogValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  
  body('slug')
    .notEmpty()
    .withMessage('Slug is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Slug must be between 3 and 255 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt must not exceed 500 characters'),
  
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  
  body('author')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Author must be between 2 and 100 characters'),
  
  body('readTime')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Read time must not exceed 20 characters'),
  
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  
  body('categories.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each category ID must be a positive integer'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each tag ID must be a positive integer')
];

export const updateBlogValidation = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  
  body('slug')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Slug must be between 3 and 255 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt must not exceed 500 characters'),
  
  body('content')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('author')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Author must be between 2 and 100 characters'),
  
  body('readTime')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Read time must not exceed 20 characters'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be either draft or published'),
  
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  
  body('categories.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each category ID must be a positive integer'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each tag ID must be a positive integer')
];

// Generic validation result handler
const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(error => error.msg)
    } as ApiResponse);
    return false;
  }
  return true;
};

export class BlogController {
  static async getAllBlogs(req: Request, res: Response) {
    if (!handleValidationErrors(req, res)) return;

    try {
      const query: BlogQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        category: req.query.category as string,
        search: req.query.search as string
      };

      const result = await blogService.getAllBlogs(query);

      if (result.success) {
        res.json({
          success: true,
          count: result.data?.count,
          pagination: result.data?.pagination,
          data: result.data?.blogs
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Error in getAllBlogs controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getBlogBySlug(req: Request, res: Response) {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Slug is required'
      } as ApiResponse);
    }

    try {
      const result = await blogService.getBlogBySlug(slug);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        } as ApiResponse);
      } else {
        if (result.error === 'Blog not found') {
          res.status(404).json({
            success: false,
            message: result.error
          } as ApiResponse);
        } else {
          res.status(500).json({
            success: false,
            message: result.error
          } as ApiResponse);
        }
      }
    } catch (error) {
      console.error('Error in getBlogBySlug controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async createBlog(req: Request, res: Response) {
    try {
      // Handle file upload first
      uploadBlogImage(req, res, async (err: any) => {
        if (err) {
          console.error('File upload error:', err);
          return res.status(400).json({
            success: false,
            message: err.message || 'Error uploading image'
          } as ApiResponse);
        }

        // Validate the form data after file upload
        const { title, slug, excerpt, content, author, readTime, categories, tags } = req.body;

        // Manual validation for form-data
        if (!title || title.trim().length < 3) {
          return res.status(400).json({
            success: false,
            message: 'Title is required and must be at least 3 characters'
          } as ApiResponse);
        }

        if (!slug || slug.trim().length < 3) {
          return res.status(400).json({
            success: false,
            message: 'Slug is required and must be at least 3 characters'
          } as ApiResponse);
        }

        if (!content || content.trim().length < 10) {
          return res.status(400).json({
            success: false,
            message: 'Content is required and must be at least 10 characters'
          } as ApiResponse);
        }

        // Parse categories and tags if they're strings
        let parsedCategories = categories;
        let parsedTags = tags;

        if (typeof categories === 'string') {
          try {
            parsedCategories = JSON.parse(categories);
          } catch (e) {
            parsedCategories = [];
          }
        }

        if (typeof tags === 'string') {
          try {
            parsedTags = JSON.parse(tags);
          } catch (e) {
            parsedTags = [];
          }
        }

        // Get the image path if file was uploaded
        const imagePath = req.file ? `/uploads/blogs/${req.file.filename}` : '';

        const blogData = {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt ? excerpt.trim() : '',
          content: content.trim(),
          image: imagePath,
          author: author ? author.trim() : 'Admin',
          readTime: readTime ? readTime.trim() : '5 min read',
          categories: parsedCategories,
          tags: parsedTags
        };

        const result = await blogService.createBlog(blogData);

        if (result.success) {
          res.status(201).json({
            success: true,
            data: result.data,
            message: 'Blog created successfully'
          } as ApiResponse);
        } else {
          res.status(400).json({
            success: false,
            message: result.error
          } as ApiResponse);
        }
      });
    } catch (error) {
      console.error('Error in createBlog controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async updateBlog(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid blog ID is required'
      } as ApiResponse);
    }

    if (!handleValidationErrors(req, res)) return;

    try {
      const blogData = req.body;
      const result = await blogService.updateBlog(parseInt(id), blogData);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          message: 'Blog updated successfully'
        } as ApiResponse);
      } else {
        if (result.error === 'Blog not found') {
          res.status(404).json({
            success: false,
            message: result.error
          } as ApiResponse);
        } else {
          res.status(400).json({
            success: false,
            message: result.error
          } as ApiResponse);
        }
      }
    } catch (error) {
      console.error('Error in updateBlog controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async deleteBlog(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Valid blog ID is required'
      } as ApiResponse);
    }

    try {
      const result = await blogService.deleteBlog(parseInt(id));

      if (result.success) {
        res.json({
          success: true,
          message: result.message
        } as ApiResponse);
      } else {
        if (result.error === 'Blog not found') {
          res.status(404).json({
            success: false,
            message: result.error
          } as ApiResponse);
        } else {
          res.status(500).json({
            success: false,
            message: result.error
          } as ApiResponse);
        }
      }
    } catch (error) {
      console.error('Error in deleteBlog controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const result = await blogService.getCategories();

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        } as ApiResponse);
      }
    } catch (error) {
      console.error('Error in getCategories controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      } as ApiResponse);
    }
  }
}
