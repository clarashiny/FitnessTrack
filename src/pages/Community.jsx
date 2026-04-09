// src/components/Community.jsx
import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaHeart, FaUserFriends } from "react-icons/fa";

const Community = () => {
  // Current logged-in user (example fallback if none in localStorage)
  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {
      id: "user1",
      name: "You",
    };

  // Posts state
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("communityPosts");
    if (!saved) {
      return [
        {
          id: 1,
          user: "Alex",
          content: "Completed 30 min Yoga 💪",
          likes: [],
          comments: [],
          image: null,
        },
        {
          id: 2,
          user: "Sara",
          content: "Running challenge day 5 🔥",
          likes: [],
          comments: [],
          image: null,
        },
      ];
    }
    return JSON.parse(saved).map((post) => ({
      ...post,
      likes: Array.isArray(post.likes) ? post.likes : [],
      comments: Array.isArray(post.comments) ? post.comments : [],
    }));
  });

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Persist posts to localStorage
  useEffect(() => {
    localStorage.setItem("communityPosts", JSON.stringify(posts));
  }, [posts]);

  // Create or Update post
  const handlePost = () => {
    if (!text.trim() && !image) return;

    if (editingId) {
      setPosts(
        posts.map((p) =>
          p.id === editingId ? { ...p, content: text, image } : p
        )
      );
      setEditingId(null);
    } else {
      setPosts([
        {
          id: Date.now(),
          user: currentUser.name, // ✅ Always use name
          content: text,
          likes: [],
          comments: [],
          image,
        },
        ...posts,
      ]);
    }

    setText("");
    setImage(null);
  };

  const handleEdit = (post) => {
    setText(post.content || "");
    setImage(post.image || null);
    setEditingId(post.id);
  };

  const handleDelete = (id) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  // Like/unlike post
  const handleLike = (postId) => {
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          const likesArray = Array.isArray(p.likes) ? p.likes : [];
          const userLiked = likesArray.includes(currentUser.id);

          return {
            ...p,
            likes: userLiked
              ? likesArray.filter((id) => id !== currentUser.id)
              : [...likesArray, currentUser.id],
          };
        }
        return p;
      })
    );
  };

  // Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">

        {/* LEFT – POSTS */}
        <div className="md:col-span-2 space-y-6">

          {/* CREATE POST */}
          <div className="bg-zinc-200 p-4 rounded-xl shadow">
            <label className="block mb-2 font-semibold">
              Post as {currentUser.name}
            </label>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your progress..."
              className="w-full border rounded p-2 mb-2"
            />

            <input type="file" onChange={handleImageUpload} className="mb-2" />

            {image && (
              <img
                src={image}
                alt="preview"
                className="max-w-full max-h-96 rounded mb-2 border"
              />
            )}

            <button
              onClick={handlePost}
              className="px-4 py-1 bg-emerald-500 text-white rounded text-sm"
            >
              {editingId ? "Update" : "Post"}
            </button>
          </div>

          {/* POSTS LIST */}
          {posts.map((post) => {
            const isLiked = post.likes.includes(currentUser.id);

            return (
              <div
                key={post.id}
                className="bg-zinc-200 p-4 rounded-xl shadow space-y-2"
              >
                <h3 className="font-semibold">{currentUser.name}</h3> {/* ✅ Name only */}

                {post.content && <p className="text-gray-700">{post.content}</p>}

                {post.image && (
                  <img
                    src={post.image}
                    alt="post"
                    className="w-full max-h-[600px] rounded"
                  />
                )}

                {/* Likes & Actions */}
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${
                      isLiked
                        ? "bg-red-500 text-white"
                        : "bg-zinc-300 text-gray-700"
                    }`}
                  >
                    <FaHeart /> {post.likes.length}
                  </button>

                  <div className="flex gap-3 text-sm">
                    {post.user === currentUser.name && (
                      <>
                        <FaEdit
                          onClick={() => handleEdit(post)}
                          className="cursor-pointer text-blue-500"
                        />
                        <FaTrash
                          onClick={() => handleDelete(post.id)}
                          className="cursor-pointer text-red-500"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* COMMENTS */}
                <div className="mt-2 space-y-1">
                  {post.comments.map((c) => (
                    <p key={c.id} className="text-sm text-gray-700">
                      <b>{c.user}:</b> {c.text}
                    </p>
                  ))}

                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full border p-1 rounded text-sm"
                    value={post.newComment || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPosts(posts.map((p) =>
                        p.id === post.id ? { ...p, newComment: value } : p
                      ));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && post.newComment?.trim()) {
                        const newComment = {
                          id: Date.now(),
                          user: currentUser.name, // ✅ Name only
                          text: post.newComment,
                        };
                        setPosts(posts.map((p) =>
                          p.id === post.id
                            ? {
                                ...p,
                                comments: [...p.comments, newComment],
                                newComment: "",
                              }
                            : p
                        ));
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT – INFO PANEL */}
        <div className="sticky top-6 h-fit space-y-4">
          <div className="bg-zinc-200 p-4 rounded-xl shadow text-center">
            <FaUserFriends className="text-3xl mx-auto text-emerald-500" />
            <h3 className="font-bold mt-2">Community</h3>
            <p className="text-sm text-gray-600">
              Stay active & connected
            </p>
          </div>

          <div className="bg-zinc-200 p-4 rounded-xl shadow">
            <h4 className="font-semibold mb-2">Stats</h4>
            <p className="text-sm">👥 Members: {posts.length}</p>
            <p className="text-sm">📝 Posts: {posts.length}</p>
            <p className="text-sm">
              🔥 Active Today: {posts.filter((p) => p.likes.length > 0).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
