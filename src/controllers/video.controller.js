import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  const videofile = req.files?.videoFile[0]?.path;
  const thumbnail = req.files?.thumbnail[0]?.path;

  if (!videofile || !thumbnail) {
    throw new ApiError(400, "Video and thumbnailfile are required");
  }

  const video_file = await uploadOnCloudinary(videofile);
  const video_thumbnail = await uploadOnCloudinary(thumbnail);

  console.log("videoo_file", video_file.url);

  const video = await Video.create({
    title,
    description,
    videoFile: video_file.url,
    thumbnail: video_thumbnail.url,
    duration: video_file.duration,
    views: 0,
    isPublished: true,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video uploaded Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(401, "Video not found");
    }

    return res.json(new ApiResponse(200, video, "Video found"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Comment update failed");
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;

  try {
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $set: { title, description, thumbnail } },
      { new: true }
    );

    if (!updatedVideo) {
      throw new ApiError(401, "Video not found");
    }

    return res.json(updatedVideo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new ApiError(401, "Video not found");
    }

    await Video.deleteOne({ _id: videoId });

    return res.json(new ApiResponse(200, "Video Deleted Successfully"));
  } catch (error) {
    throw new ApiError(401, "Internal Server Error");
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
