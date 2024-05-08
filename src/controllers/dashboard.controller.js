import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const allLikes = await Like.aggregate([
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalVideoLikes: {
            $sum: {
              $cond: [{ $ifNull: ["$video", false] }, 1, 0],
            },
          },

          totalCommentLikes: {
            $sum: {
              $cond: [{ $ifNull: ["$comment", false] }, 1, 0],
            },
          },
        },
      },
    ]);

    const allSubscribers = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $count: "subscribers",
      },
    ]);

    const allVideos = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $count: "Videos",
      },
    ]);

    const allViews = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          allVideoViews: {
            $sum: "$views",
          },
        },
      },
    ]);

    const result = {
      allLikes: allLikes[0] || { totalVideoLikes: 0, totalCommentLikes: 0 },
      allSubscribers: allSubscribers[0]?.subscribers || 0,
      allVideos: allVideos[0]?.Videos || 0,
      allViews: allViews[0]?.allVideoViews || 0,
    };

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "All information fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while fetching videos");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const channelVideos = await Video.aggregate([
      {
        $match: { owner: userId },
      },
      {
        $project: {
          title: 1,
          description: 1,
          videoUrl: "$videoFile.url",
        },
      },
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(200, channelVideos, "All videos fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while fetching videos");
  }
});
export { getChannelStats, getChannelVideos };
