import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "This subscriber id is not valid");
  }

  try {
    const existingSubscription = await Subscription.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });

    if (existingSubscription) {
      await Subscription.findByIdAndDelete(existingSubscription._id);
      res.status(200).json(new ApiResponse(200, "Subscription toggled off"));
    } else {
      const newSubscription = new Subscription({
        subscriber: subscriberId,
        channel: channelId,
      });
      await newSubscription.save();
      res.status(200).json(new ApiResponse(200, "Subscription toggled on"));
    }
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "This channel id is not valid");
  }

  try {
    const subscribedChannels = await Subscription.aggregate([
      {
        $match: { channel: new mongoose.Types.ObjectId(channelId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriber",
        },
      },
      {
        $unwind: "$subscriber",
      },
      {
        $project: {
          _id: "$subscriber._id",
          username: "$subscriber.username",
          email: "$subscriber.email",
        },
      },
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(200, subscribedChannels, "Channel subscribers are")
      );
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "This subscriber id is not valid");
  }

  try {
    const subscribedChannels = await Subscription.aggregate([
      {
        $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channel",
        },
      },
      {
        $unwind: "$channel",
      },
      {
        $project: {
          _id: "$channel._id",
          username: "$channel.username",
          email: "$channel.email",
        },
      },
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(200, subscribedChannels, "Channels subscribed to are")
      );
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
