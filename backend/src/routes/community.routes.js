import { Router } from "express";
import {
  createComment,
  createPost,
  getPost,
  listComments,
  listPosts,
  listTags,
  toggleLike,
} from "../repositories/community.repo.js";
import { asyncHandler, paginate } from "../utils/helpers.js";
import { ApiError } from "../utils/api-error.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get(
  "/posts",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const posts = await listPosts({
      tag: req.query.tag,
      search: req.query.search,
      userId: req.user?.id ?? 0,
    });
    const result = paginate(posts, { page: req.query.page, pageSize: req.query.pageSize ?? 8 });
    result.data = result.data.map((post) => ({
      ...post,
      liked: req.user ? Boolean(post.liked) : false,
    }));
    res.json(result);
  })
);

router.post(
  "/posts",
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body ?? {};
    if (!title || !content) throw ApiError.badRequest("Title and content are required.");
    const post = await createPost({
      userId: req.user.id,
      author: req.user.fullName,
      authorRole: req.user.role,
      title,
      content,
      tags: Array.isArray(tags)
        ? tags
        : String(tags ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    });
    res.status(201).json({ ...post, liked: false });
  })
);

router.post(
  "/posts/:id/like",
  authenticate,
  asyncHandler(async (req, res) => {
    const post = await getPost(req.params.id);
    if (!post) throw ApiError.notFound("Post not found.");
    res.json(await toggleLike(post.id, req.user.id));
  })
);

router.get(
  "/posts/:id/comments",
  asyncHandler(async (req, res) => {
    const post = await getPost(req.params.id);
    if (!post) throw ApiError.notFound("Post not found.");
    res.json(await listComments(post.id));
  })
);

router.post(
  "/posts/:id/comments",
  authenticate,
  asyncHandler(async (req, res) => {
    const post = await getPost(req.params.id);
    if (!post) throw ApiError.notFound("Post not found.");
    const content = String(req.body?.content ?? "").trim();
    if (!content) throw ApiError.badRequest("Comment cannot be empty.");
    const comment = await createComment(post.id, {
      userId: req.user.id,
      author: req.user.fullName,
      authorRole: req.user.role,
      content,
    });
    res.status(201).json(comment);
  })
);

router.get(
  "/tags",
  asyncHandler(async (_req, res) => {
    res.json(await listTags());
  })
);

export default router;
