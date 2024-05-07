import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

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
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
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
