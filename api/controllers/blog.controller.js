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

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const buildUniqueSlug = async (title, preferredSlug, existingId) => {
  const base = slugify(preferredSlug || title);
  if (!base) throw errorHandler(400, "Blog title is required");

  let slug = base;
  let suffix = 1;
  while (
    await Blog.exists({
      slug,
      ...(existingId ? { _id: { $ne: existingId } } : {}),
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

export const createBlog = async (req, res, next) => {
  try {
    const blogData = pickBlogFields(req.body);
    blogData.title = blogData.title?.trim();
    blogData.content = blogData.content?.trim();
    blogData.excerpt = blogData.excerpt?.trim();
    blogData.image = blogData.image?.trim();
    blogData.category = blogData.category?.trim() || "Gardening";
    blogData.author = req.user.username || blogData.author?.trim() || "Gardenly Admin";
    blogData.date = blogData.date || new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (!blogData.title || !blogData.content) {
      return next(errorHandler(400, "Blog title and content are required"));
    }

    blogData.slug = await buildUniqueSlug(blogData.title, blogData.slug);

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
    const update = pickBlogFields(req.body);
    if (update.title !== undefined) update.title = update.title?.trim();
    if (update.content !== undefined) update.content = update.content?.trim();
    if (update.excerpt !== undefined) update.excerpt = update.excerpt?.trim();
    if (update.image !== undefined) update.image = update.image?.trim();
    if (update.category !== undefined) update.category = update.category?.trim() || "Gardening";
    if (update.slug !== undefined || update.title !== undefined) {
      update.slug = await buildUniqueSlug(update.title || update.slug, update.slug, req.params.id);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: update },
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

    const index = blog.likes.findIndex((userId) => userId.toString() === req.user.id);
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
