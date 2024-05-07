import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "This video id is not valid");
  }

  try {
    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: userId,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      res.status(200).json(new ApiResponse(200, "Video Like toggled off"));
    } else {
      const newLike = new Like({
        video: videoId,
        likedBy: userId,
      });
      await newLike.save();
      res.status(200).json(new ApiResponse(200, "Video Like toggled on"));
    }
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "This comment id is not valid");
  }
  try {
    const existingLike = await Like.findOne({
      comment: commentId,
      likedBy: userId,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      res.status(200).json(new ApiResponse(200, "Comment Like toggled off"));
    } else {
      const newLike = new Like({
        comment: commentId,
        likedBy: userId,
      });
      await newLike.save();
      res.status(200).json(new ApiResponse(200, "Comment Like toggled on"));
    }
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log("userid", userId);

  try {
    const likedVideos = await Like.aggregate([
      {
        $match: { likedBy: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
        },
      },
      {
        $unwind: "$video",
      },
      {
        $project: {
          _id: "$video._id",
          title: "$video.title",
          description: "$video.description",
          url: "$video.videoFile",
        },
      },
    ]);

    res
      .status(200)
      .json(new ApiResponse(200, likedVideos, "All Liked Videos are"));
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

export { toggleCommentLike, toggleVideoLike, getLikedVideos };
