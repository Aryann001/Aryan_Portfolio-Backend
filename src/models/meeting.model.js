import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    client_name: String,
    client_email: String,
    client_project_description: String,
    date: Date,
    isCompleted: Boolean,
    isVerified: Boolean,
    OTP: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Meeting", meetingSchema);
