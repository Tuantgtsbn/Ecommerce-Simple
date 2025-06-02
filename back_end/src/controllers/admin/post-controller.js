const { generateUniqueSlug, PostsModel: Post } = require('../../models/Posts');

exports.createPost = async (req, res) => {
    try {
        const {
            title,
            content,
            excerpt,
            categories,
            published_at,
            status,
            visibility,
            author_id,
            featured_image
        } = req.body;
        const newPost = new Post({
            title,
            content,
            excerpt,
            categories,
            published_at,
            status,
            visibility,
            author_id,
            featured_image
        });
        await newPost.save();
        return res.status(200).json({
            success: true,
            message: 'Create post successfully',
            data: newPost
        });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern.slug) {
            return res.status(400).json({
                success: false,
                message: 'Slug already exists'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};

exports.updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const currentPost = await Post.findById(postId)
            .select('tittle slug')
            .lean();
        if (!currentPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        const updates = req.body;
        if (updates.title && updates.title !== currentPost.title) {
            updates.slug = await generateUniqueSlug(updates.title, postId);
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $set: { ...updates, updated_at: new Date() } },
            { new: true }
        );
        if (!updatedPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Update post successfully',
            data: updatedPost
        });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern.slug) {
            return res.status(400).json({
                success: false,
                message: 'Slug already exists'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
};
