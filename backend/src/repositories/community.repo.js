import { query, withTransaction } from "../config/db.js";
import { mapCommunityComment, mapCommunityPost } from "../db/mappers.js";

export async function listPosts({ tag, search, userId } = {}) {
  const rows = await query(
    `SELECT p.*, EXISTS(
       SELECT 1 FROM community_likes l WHERE l.post_id = p.id AND l.user_id = ?
     ) AS liked
     FROM community_posts p
     ORDER BY p.created_at DESC, p.id DESC`,
    [Number(userId ?? 0)]
  );
  let posts = rows.map(mapCommunityPost);
  if (tag && tag !== "all") posts = posts.filter((post) => post.tags.includes(String(tag)));
  if (search) {
    const q = String(search).toLowerCase();
    posts = posts.filter(
      (post) => post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q)
    );
  }
  return posts;
}

export async function getPost(id) {
  const rows = await query("SELECT * FROM community_posts WHERE id = ? LIMIT 1", [Number(id)]);
  return mapCommunityPost(rows[0]);
}

export async function createPost(data) {
  const result = await query(
    `INSERT INTO community_posts (user_id, author, author_role, title, content, tags, likes, comments_count)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0)`,
    [
      Number(data.userId),
      data.author,
      data.authorRole,
      data.title,
      data.content,
      JSON.stringify(data.tags ?? []),
    ]
  );
  return getPost(result.insertId);
}

export async function toggleLike(postId, userId) {
  return withTransaction(async (execute) => {
    const existing = await execute(
      "SELECT 1 FROM community_likes WHERE post_id = ? AND user_id = ? LIMIT 1",
      [Number(postId), Number(userId)]
    );
    const wasLiked = existing.length > 0;
    if (wasLiked) {
      await execute("DELETE FROM community_likes WHERE post_id = ? AND user_id = ?", [
        Number(postId),
        Number(userId),
      ]);
    } else {
      await execute("INSERT INTO community_likes (post_id, user_id) VALUES (?, ?)", [
        Number(postId),
        Number(userId),
      ]);
    }
    const counts = await execute("SELECT COUNT(*) AS total FROM community_likes WHERE post_id = ?", [
      Number(postId),
    ]);
    const likes = Number(counts[0]?.total ?? 0);
    await execute("UPDATE community_posts SET likes = ? WHERE id = ?", [likes, Number(postId)]);
    return { likes, liked: !wasLiked };
  });
}

export async function listComments(postId) {
  const rows = await query(
    "SELECT * FROM community_comments WHERE post_id = ? ORDER BY created_at ASC, id ASC",
    [Number(postId)]
  );
  return rows.map(mapCommunityComment);
}

export async function createComment(postId, data) {
  return withTransaction(async (execute) => {
    const result = await execute(
      `INSERT INTO community_comments (post_id, user_id, author, author_role, content)
       VALUES (?, ?, ?, ?, ?)`,
      [Number(postId), Number(data.userId), data.author, data.authorRole, data.content]
    );
    await execute("UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = ?", [
      Number(postId),
    ]);
    const rows = await execute("SELECT * FROM community_comments WHERE id = ?", [result.insertId]);
    return mapCommunityComment(rows[0]);
  });
}

export async function listTags() {
  const rows = await query("SELECT tags FROM community_posts");
  const tags = new Set();
  for (const row of rows) {
    const value = typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags;
    if (Array.isArray(value)) value.forEach((tag) => tags.add(tag));
  }
  return [...tags];
}
