import React, { useState } from 'react';
import axios from 'axios';
import './BlogPostForm.css';

const BlogPostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/blogs', formData);
      setSuccess('Blog post created successfully');
      setError('');
      setFormData({
        title: '',
        content: ''
      });
    } catch (err) {
      console.error(err);
      setError('Failed to create blog post');
    }
  };

  return (
    <div className="blog-post-form-container">
      <h2>Create New Blog Post</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={onChange}
            required
          />
        </div>
        <button type="submit">Create Post</button>
      </form>
      {error && <p>{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default BlogPostForm;
