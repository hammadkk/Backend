import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const pipeline = [
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          "owner._id": 1,
          "owner.username": 1,
        },
      },
    ];

    const comments = await Comment.aggregate(pipeline);

    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Showing All Comments"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Failed to get comments");
  }
});

const addComment = asyncHandler(async (req, res) => {
  try {
    const { content, videoId, ownerId } = req.body;

    // Create a new comment
    const comment = new Comment({
      content,
      video: videoId,
      owner: ownerId,
    });

    // Save the comment to the database
    const savedComment = await comment.save();

    return res
      .status(201)
      .json(new ApiResponse(200, savedComment, "comment added"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Comment can't be added");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const { content } = req.body;

    // Find the comment by ID and update its content
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content: content,
        },
      },
      { new: true }
    );

    if (!updatedComment) {
      throw new ApiError(404, "Comment not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedComment, "comment updated"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Comment update failed");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const commentId = req.params.commentId;

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    console.log(comment);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    // Delete the comment
    await Comment.deleteOne({ _id: commentId });

    return res.status(200).json(new ApiResponse(200, null, "comment deleted"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Comment deletion failed");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
