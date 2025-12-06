import { IBlog, IBlogCategory, IBlogTag, BlogQuery, BlogResponse, BlogDetailResponse, ServiceResponse } from '../interfaces';
import db from '../config/mysql';

export class BlogService {
  async getAllBlogs(query: BlogQuery): Promise<ServiceResponse<{
    blogs: BlogResponse[];
    count: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE b.status = "published"';
      const params: any[] = [];

      if (query.category) {
        whereClause += ' AND c.slug = ?';
        params.push(query.category);
      }

      if (query.search) {
        whereClause += ' AND (b.title LIKE ? OR b.excerpt LIKE ? OR b.content LIKE ?)';
        params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
      }

      // Count total blogs
      const countQuery = `
        SELECT COUNT(DISTINCT b.id) as total
        FROM blogs b
        LEFT JOIN blog_categories bc ON b.id = bc.blog_id
        LEFT JOIN categories c ON bc.category_id = c.id
        ${whereClause}
      `;
      const [countResult] = await db.execute(countQuery, params);
      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      // Fetch blogs with pagination
      const blogsQuery = `
        SELECT DISTINCT
          b.id,
          b.title,
          b.slug,
          b.excerpt,
          b.content,
          b.image,
          b.author,
          b.publish_date,
          b.read_time,
          GROUP_CONCAT(DISTINCT c.name) as categories,
          GROUP_CONCAT(DISTINCT t.name) as tags
        FROM blogs b
        LEFT JOIN blog_categories bc ON b.id = bc.blog_id
        LEFT JOIN categories c ON bc.category_id = c.id
        LEFT JOIN blog_tags bt ON b.id = bt.blog_id
        LEFT JOIN tags t ON bt.tag_id = t.id
        ${whereClause}
        GROUP BY b.id
        ORDER BY b.publish_date DESC
        LIMIT ? OFFSET ?
      `;

      const [blogs] = await db.execute(blogsQuery, [...params, limit, offset]);

      const blogData = (blogs as any[]).map(blog => ({
        id: blog.id.toString(),
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        image: blog.image,
        author: blog.author,
        publishDate: blog.publish_date,
        readTime: blog.read_time,
        categories: blog.categories ? blog.categories.split(',') : [],
        tags: blog.tags ? blog.tags.split(',') : []
      }));

      return {
        success: true,
        data: {
          blogs: blogData,
          count: total,
          pagination: {
            page,
            limit,
            totalPages
          }
        }
      };
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return {
        success: false,
        error: 'Failed to fetch blogs'
      };
    }
  }

  async getBlogBySlug(slug: string): Promise<ServiceResponse<BlogDetailResponse>> {
    try {
      const blogQuery = `
        SELECT 
          b.id,
          b.title,
          b.slug,
          b.content,
          b.image,
          b.author,
          b.publish_date,
          b.read_time
        FROM blogs b
        WHERE b.slug = ? AND b.status = 'published'
      `;

      const [blogResult] = await db.execute(blogQuery, [slug]);
      
      if ((blogResult as any[]).length === 0) {
        return {
          success: false,
          error: 'Blog not found'
        };
      }

      const blog = (blogResult as any[])[0];

      // Get categories
      const categoriesQuery = `
        SELECT c.id, c.name, c.slug
        FROM categories c
        JOIN blog_categories bc ON c.id = bc.category_id
        WHERE bc.blog_id = ?
      `;
      const [categoriesResult] = await db.execute(categoriesQuery, [blog.id]);

      // Get tags
      const tagsQuery = `
        SELECT t.id, t.name, t.slug
        FROM tags t
        JOIN blog_tags bt ON t.id = bt.tag_id
        WHERE bt.blog_id = ?
      `;
      const [tagsResult] = await db.execute(tagsQuery, [blog.id]);

      // Get related posts (same category, excluding current post)
      const relatedPostsQuery = `
        SELECT DISTINCT
          b.id,
          b.title,
          b.slug,
          b.excerpt,
          b.image,
          b.publish_date,
          b.read_time
        FROM blogs b
        JOIN blog_categories bc ON b.id = bc.blog_id
        WHERE bc.category_id IN (
          SELECT category_id FROM blog_categories WHERE blog_id = ?
        )
        AND b.id != ? AND b.status = 'published'
        ORDER BY b.publish_date DESC
        LIMIT 3
      `;
      const [relatedPostsResult] = await db.execute(relatedPostsQuery, [blog.id, blog.id]);

      const blogData: BlogDetailResponse = {
        id: blog.id.toString(),
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || '',
        content: blog.content,
        image: blog.image,
        author: {
          name: blog.author,
          avatar: '/uploads/avatars/admin.jpg'
        },
        publishDate: blog.publish_date,
        readTime: blog.read_time,
        categories: categoriesResult as any[],
        tags: tagsResult as any[],
        relatedPosts: (relatedPostsResult as any[]).map(post => ({
          id: post.id.toString(),
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          image: post.image,
          publishDate: post.publish_date,
          readTime: post.read_time
        }))
      };

      return {
        success: true,
        data: blogData
      };
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      return {
        success: false,
        error: 'Failed to fetch blog'
      };
    }
  }

  async createBlog(blogData: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author: string;
    readTime: string;
    categories: number[];
    tags: number[];
  }): Promise<ServiceResponse<IBlog>> {
    try {
      // Validate required fields
      const requiredFields = ['title', 'slug', 'content'];
      for (const field of requiredFields) {
        if (!blogData[field as keyof typeof blogData]) {
          return {
            success: false,
            error: `${field} is required`
          };
        }
      }

      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Insert blog post
        const insertBlogQuery = `
          INSERT INTO blogs (title, slug, excerpt, content, image, author, read_time, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'published')
        `;

        const [blogResult] = await connection.execute(insertBlogQuery, [
          blogData.title,
          blogData.slug,
          blogData.excerpt || '',
          blogData.content,
          blogData.image || '',
          blogData.author || 'Admin',
          blogData.readTime || '5 min read'
        ]);

        const blogId = (blogResult as any).insertId;

        // Insert categories if provided
        if (blogData.categories && blogData.categories.length > 0) {
          const categoryValues = blogData.categories.map(categoryId => [blogId, categoryId]);
          const categoryQuery = 'INSERT INTO blog_categories (blog_id, category_id) VALUES ?';
          await connection.query(categoryQuery, [categoryValues]);
        }

        // Insert tags if provided
        if (blogData.tags && blogData.tags.length > 0) {
          const tagValues = blogData.tags.map(tagId => [blogId, tagId]);
          const tagQuery = 'INSERT INTO blog_tags (blog_id, tag_id) VALUES ?';
          await connection.query(tagQuery, [tagValues]);
        }

        await connection.commit();

        // Fetch the created blog with relationships
        const result = await this.getBlogById(blogId);
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      return {
        success: false,
        error: 'Failed to create blog post'
      };
    }
  }

  async getBlogById(id: number): Promise<ServiceResponse<IBlog>> {
    try {
      const query = `
        SELECT 
          b.id,
          b.title,
          b.slug,
          b.excerpt,
          b.content,
          b.image,
          b.author,
          b.publish_date,
          b.read_time,
          b.status,
          b.created_at,
          b.updated_at
        FROM blogs b
        WHERE b.id = ?
      `;

      const [blogResult] = await db.execute(query, [id]);
      
      if ((blogResult as any[]).length === 0) {
        return {
          success: false,
          error: 'Blog not found'
        };
      }

      const blog = (blogResult as any[])[0];

      return {
        success: true,
        data: blog as IBlog
      };
    } catch (error) {
      console.error('Error fetching blog by ID:', error);
      return {
        success: false,
        error: 'Failed to fetch blog'
      };
    }
  }

  async updateBlog(id: number, blogData: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    image?: string;
    author?: string;
    readTime?: string;
    status?: string;
    categories?: number[];
    tags?: number[];
  }): Promise<ServiceResponse<IBlog>> {
    try {
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Update blog post if fields are provided
        if (blogData.title || blogData.slug || blogData.excerpt || 
            blogData.content || blogData.image || blogData.author || 
            blogData.readTime || blogData.status) {
          
          const updateFields = [];
          const updateValues = [];

          if (blogData.title) {
            updateFields.push('title = ?');
            updateValues.push(blogData.title);
          }
          if (blogData.slug) {
            updateFields.push('slug = ?');
            updateValues.push(blogData.slug);
          }
          if (blogData.excerpt !== undefined) {
            updateFields.push('excerpt = ?');
            updateValues.push(blogData.excerpt);
          }
          if (blogData.content) {
            updateFields.push('content = ?');
            updateValues.push(blogData.content);
          }
          if (blogData.image !== undefined) {
            updateFields.push('image = ?');
            updateValues.push(blogData.image);
          }
          if (blogData.author) {
            updateFields.push('author = ?');
            updateValues.push(blogData.author);
          }
          if (blogData.readTime) {
            updateFields.push('read_time = ?');
            updateValues.push(blogData.readTime);
          }
          if (blogData.status) {
            updateFields.push('status = ?');
            updateValues.push(blogData.status);
          }

          updateFields.push('updated_at = CURRENT_TIMESTAMP');
          updateValues.push(id);

          const updateQuery = `UPDATE blogs SET ${updateFields.join(', ')} WHERE id = ?`;
          await connection.execute(updateQuery, updateValues);
        }

        // Update categories if provided
        if (blogData.categories !== undefined) {
          // Delete existing categories
          await connection.execute('DELETE FROM blog_categories WHERE blog_id = ?', [id]);
          
          // Insert new categories
          if (blogData.categories.length > 0) {
            const categoryValues = blogData.categories.map(categoryId => [id, categoryId]);
            const categoryQuery = 'INSERT INTO blog_categories (blog_id, category_id) VALUES ?';
            await connection.query(categoryQuery, [categoryValues]);
          }
        }

        // Update tags if provided
        if (blogData.tags !== undefined) {
          // Delete existing tags
          await connection.execute('DELETE FROM blog_tags WHERE blog_id = ?', [id]);
          
          // Insert new tags
          if (blogData.tags.length > 0) {
            const tagValues = blogData.tags.map(tagId => [id, tagId]);
            const tagQuery = 'INSERT INTO blog_tags (blog_id, tag_id) VALUES ?';
            await connection.query(tagQuery, [tagValues]);
          }
        }

        await connection.commit();

        // Fetch the updated blog
        const result = await this.getBlogById(id);
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      return {
        success: false,
        error: 'Failed to update blog post'
      };
    }
  }

  async deleteBlog(id: number): Promise<ServiceResponse<null>> {
    try {
      const query = 'DELETE FROM blogs WHERE id = ?';
      const [result] = await db.execute(query, [id]);

      if ((result as any).affectedRows === 0) {
        return {
          success: false,
          error: 'Blog not found'
        };
      }

      return {
        success: true,
        data: null,
        message: 'Blog deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting blog:', error);
      return {
        success: false,
        error: 'Failed to delete blog post'
      };
    }
  }

  async getCategories(): Promise<ServiceResponse<IBlogCategory[]>> {
    try {
      const query = `
        SELECT 
          c.id,
          c.name,
          c.slug,
          c.description,
          COUNT(bc.blog_id) as postCount
        FROM categories c
        LEFT JOIN blog_categories bc ON c.id = bc.category_id
        LEFT JOIN blogs b ON bc.blog_id = b.id AND b.status = 'published'
        GROUP BY c.id
        ORDER BY c.name
      `;

      const [categories] = await db.execute(query);

      return {
        success: true,
        data: categories as IBlogCategory[]
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: 'Failed to fetch categories'
      };
    }
  }
}
