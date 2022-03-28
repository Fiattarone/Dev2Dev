const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route       POST api/posts
// @description Create a post
// @access      Private

router.post("/", [
    auth, [
        check("text", "Text is required").not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select("-password");

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save();

        res.json(post);

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error.")
    }
});

// @route       GET api/posts
// @description Get (all) posts
// @access      Private

router.get("/", auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1}); //Date: 1 does oldest first
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.")
    }
});


// @route       GET api/posts/:id
// @description Get post by id
// @access      Private

router.get("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "No post found." });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") return res.status(404).json({ message: "No post found." });
        res.status(500).send("Server Error.")
    }
});

// @route       DELETE api/posts/:id
// @description Delete a post
// @access      Private

router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "No post found." });
        }
        
        //Check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "User not authorized." });
        }

        await post.remove();

        res.json({ message: "Post removed." });
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") return res.status(404).json({ message: "No post found." });
        res.status(500).send("Server Error.")
    }
});

// @route       PUT api/posts/like/:id
// @description like a post
// @access      Private

router.put("/like/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if post has already been liked

        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ message: "Post has already been liked."});
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);   
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.");
    }
});

// @route       PUT api/posts/unlike/:id
// @description unlike a post
// @access      Private

router.put("/unlike/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if post has already been liked

        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ message: "Post has not yet been liked."});
        }

        // Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);   
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.");
    }
});

module.exports = router;