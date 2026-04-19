import Blog from "../models/blog.model.js";
import { errorHandler } from "../utils/error.js";

export const createBlog = async (req, res, next) => {
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
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
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBlog) return next(errorHandler(404, "Blog not found"));
    res.status(200).json({ success: true, blog: updatedBlog });
  } catch (err) {
    next(err);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return next(errorHandler(404, "Blog not found"));
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
    res.status(200).json({ success: true, likes: blog.likes.length });
  } catch (err) {
    next(err);
  }
};

export const commentOnBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(errorHandler(404, "Blog not found"));

    const comment = {
      userId: req.user.id,
      username: req.user.username || "Anonymous",
      text: req.body.text,
    };

    blog.comments.push(comment);
    await blog.save();
    res.status(201).json({ success: true, comments: blog.comments });
  } catch (err) {
    next(err);
  }
};
