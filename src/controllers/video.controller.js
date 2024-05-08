import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page, limit, query, sortBy, sortType, userId } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const pipeline = [
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $sort: {
        [sortBy]: parseInt(sortType),
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ];

  try {
    const videosAggregate = await Video.aggregate(pipeline);

    const paginatedVideos = await Video.aggregatePaginate(videosAggregate, {
      page,
      limit,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, paginatedVideos, "Fetched all videos successfully")
      );
  } catch (error) {
    throw new ApiError(500, error, "Internal Server Error");
  }
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

  if (!video_file || !video_thumbnail) {
    throw new ApiError(400, "Error uploading to Cloudinary");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: {
      public_id: video_file?.public_id,
      url: video_file?.url,
    },
    thumbnail: {
      public_id: video_thumbnail?.public_id,
      url: video_thumbnail?.url,
    },
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
    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );

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
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "This video id is not valid");
  }

  const video = await Video.findById(videoId);

  if (!title.trim() || !description.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const thumbnailNew = req.file?.path;

  console.log("thumbnail", thumbnailNew);

  if (!thumbnailNew) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  const videoThumbnail = await uploadOnCloudinary(thumbnailNew);

  if (!videoThumbnail) {
    throw new ApiError(400, "Error uploading to Cloudinary");
  }

  const videoDeleted = await deleteOnCloudinary(video.thumbnail?.public_id);

  if (!videoDeleted) {
    throw new ApiError(
      400,
      "Error while deleting previous thumbnail from Cloudinary"
    );
  }

  try {
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
          description,
          thumbnail: {
            url: videoThumbnail.url,
            public_id: videoThumbnail.public_id,
          },
        },
      },
      { new: true }
    );

    if (!updatedVideo) {
      throw new ApiError(401, "Video not updated");
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

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is not valid");
  }

  const video = await Video.findById({
    _id: videoId,
  });

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  video.isPublished = !video.isPublished;

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video toggled successfully!!"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
