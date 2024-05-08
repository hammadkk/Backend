import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const owner = req.user._id;

  try {
    const existingPlaylist = await Playlist.findOne({ name, owner });

    if (existingPlaylist) {
      return res
        .status(400)
        .json(new ApiResponse(200, "Playlist with same name already exists"));
    }

    const newPlaylist = new Playlist({
      name,
      description,
      owner,
    });

    await newPlaylist.save();

    res.status(201).json(new ApiResponse(200, newPlaylist, "Playlist Created"));
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "This user id is not valid");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  try {
    const userPlaylists = await Playlist.aggregate([
      {
        $match: { owner: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
        },
      },
    ]);

    res
      .status(200)
      .json(new ApiResponse(200, userPlaylists, "Showing All Playlists"));
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res
        .status(404)
        .json(new ApiResponse(200, u, "Playlist not found"));
    }

    res.status(200).json(new ApiResponse(200, playlist, "Playlist Found"));
  } catch (error) {
    throw new ApiError(404, "User not found");
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "The playlist id is not valid");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "The video id is not valid");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "No playlist found!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video doesn't exist");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in this playlist");
  }

  try {
    const addedToPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $push: { videos: videoId } },
      { new: true }
    );

    if (!addedToPlaylist) {
      throw new ApiError(
        500,
        "Something went wrong while adding video to the playlist "
      );
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, playlist, "Video added to playlist succesfully")
      );
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "The playlist id is not valid");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "The video id is not valid");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "No playlist found!");
  }

  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video does not exist in this playlist");
  }

  try {
    const removedFromPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: videoId } },
      { new: true }
    );

    if (!removedFromPlaylist) {
      throw new ApiError(
        500,
        "Something went wrong while removing video from the playlist"
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          removedFromPlaylist,
          "Video removed from playlist successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "The playlist id is not valid");
  }

  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
      throw new ApiError(
        404,
        "Playlist not found or the video has been already removed"
      );
    }
    res
      .status(200)
      .json(new ApiResponse(200, null, "Playlist deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message);
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "The playlist id is not valid");
  }

  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { name, description },
      { new: true }
    );

    if (!updatedPlaylist) {
      throw new ApiError(404, "Playlist not found!");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, error?.message);
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
