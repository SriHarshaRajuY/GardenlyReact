import Blog from "../models/blog.model.js";
import { errorHandler } from "../utils/error.js";
import { clearCache } from "../utils/cache.js";

const BLOG_FIELDS = ["title", "slug", "content", "excerpt", "image", "author", "category", "date"];

const pickBlogFields = (body) =>
  BLOG_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});

const clearBlogCaches = async () => {
  await Promise.all([clearCache("blogs"), clearCache("blog")]);
};

export const createBlog = async (req, res, next) => {
  try {
    const blogData = pickBlogFields(req.body);
    blogData.author = req.user.username || blogData.author || "Gardenly Admin";

    const newBlog = new Blog(blogData);
    await newBlog.save();
    await clearBlogCaches();
    res.status(201).json({ success: true, blog: newBlog });
  } catch (err) {
    next(err);
  }
};

export const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (err) {
    next(err);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return next(errorHandler(404, "Blog not found"));
    res.status(200).json({ success: true, blog });
  } catch (err) {
    next(err);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: pickBlogFields(req.body) },
      { new: true, runValidators: true }
    );
    if (!updatedBlog) return next(errorHandler(404, "Blog not found"));
    await clearBlogCaches();
    res.status(200).json({ success: true, blog: updatedBlog });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return next(errorHandler(404, "Blog not found"));
    await clearBlogCaches();
    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    next(err);
  }
};
export const likeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(errorHandler(404, "Blog not found"));

    const index = blog.likes.indexOf(req.user.id);
    if (index === -1) {
      blog.likes.push(req.user.id);
    } else {
      blog.likes.splice(index, 1);
    }

    await blog.save();
    await clearBlogCaches();
    res.status(200).json({ success: true, likes: blog.likes.length });
  } catch (err) {
    next(err);
  }
};

export const commentOnBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(errorHandler(404, "Blog not found"));
    if (!req.body.text?.trim()) return next(errorHandler(400, "Comment text is required"));

    const comment = {
      userId: req.user.id,
      username: req.user.username || "Anonymous",
      text: req.body.text.trim(),
    };

    blog.comments.push(comment);
    await blog.save();
    await clearBlogCaches();
    res.status(201).json({ success: true, comments: blog.comments });
  } catch (err) {
    next(err);
  }
};
