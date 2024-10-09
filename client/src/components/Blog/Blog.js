import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Blog.css';

const Blog = ({ isAdmin }) => {  // Pass isAdmin prop to check if the user is admin
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/blogs');
        setBlogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/blogs/${id}`);
      setBlogs(blogs.filter(blog => blog._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="blog-container">
      <h2>Blog</h2>
      {blogs.map(blog => (
        <div key={blog._id} className="blog-post">
          <h3>{blog.title}</h3>
          <p>{blog.content}</p>
          {isAdmin && (
            <button onClick={() => handleDelete(blog._id)}>Delete Post</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Blog;
