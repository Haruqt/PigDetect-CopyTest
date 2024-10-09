const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Blog = require('../../models/Blog');
const checkAdmin = require('../../middleware/checkAdmin');

// @route    GET api/blogs
// @desc     Get all blog posts
// @access   Public
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/blogs
// @desc     Create a blog post
// @access   Private (admin only)
router.post(
  '/',
  [
    checkAdmin, // Use the middleware here
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;

    try {
      const newBlog = new Blog({
        title,
        content,
        user: req.user.id
      });

      const blog = await newBlog.save();
      res.json(blog);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    DELETE api/blogs/:id
// @desc     Delete a blog post
// @access   Private (admin only)
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    await blog.remove();
    res.json({ msg: 'Blog post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
