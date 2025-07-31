import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    keyFeatures: [
      {
        type: String,
      },
    ],
    stack: [
      {
        type: String,
      },
    ],
    thumbnail: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    snapshots: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    githubLink: {
      type: String,
      required: [true, "Github link is required"],
    },
    live: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
