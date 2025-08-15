import User from "../models/user.model.js";
import catchAsyncHandler from "../utils/catchAsyncHandler.js";
import { upload, deleteUploadedFile } from "../utils/cloudinary.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendCookie from "../utils/sendCookie.js";

export const register = catchAsyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("User already exist.", 400));
  }

  user = await User.create({ name, email, password });

  sendCookie(user, res, 201);
});

export const login = catchAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("All fields are required.", 400));
  }

  let user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User don't exist", 400));
  }

  const isCorrectPass = await user.comparePassword(password);

  if (!isCorrectPass) {
    return next(new ErrorHandler("Invalid Password", 400));
  }

  sendCookie(user, res, 200);
});

export const logout = catchAsyncHandler(async (req, res, next) => {
  const options = {
    httpOnly: true,
    expires: new Date(Date.now()),
    sameSite: process.env.NODE_ENV === "PRODUCTION" ? "none" : "lax",
    secure: process.env.NODE_ENV === "PRODUCTION" ? true : false,
  };

  res.status(200).cookie("userToken", null, options).json({
    success: true,
    message: "Logout successfully",
  });
});

export const deleteUser = catchAsyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  let user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User don't exist", 400));
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

export const updateUser = catchAsyncHandler(async (req, res, next) => {
  const inputFields = [
    "name",
    "email",
    "title",
    "description",
    "aboutMe",
    "githubLink",
    "linkedInLink",
    "copyright",
  ];

  if (!inputFields.every((field) => field in req.body)) {
    return next(new ErrorHandler("Required field is missing."));
  }

  const {
    name,
    email,
    title,
    description,
    aboutMe,
    githubLink,
    linkedInLink,
    copyright,
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      email,
      title,
      description,
      aboutMe,
      githubLink,
      linkedInLink,
      copyright,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  sendCookie(user, res, 200);
});

export const updateStack = catchAsyncHandler(async (req, res, next) => {
  const stackImages = req.files;
  const { stackDescriptions } = req.body;

  if (!stackImages || !stackDescriptions) {
    return next(
      new ErrorHandler("Stack details are not provided properly", 400)
    );
  }

  if (req.user.stack.length > 0) {
    for (let i = 0; i < req.user.stack.length; i++) {
      await deleteUploadedFile(req.user.stack[i].image.public_id);
    }
  }

  const newStack = [];

  for (let i = 0; i < stackImages.length; i++) {
    const image = stackImages[i];
    const description = stackDescriptions[i];

    const result = await upload(image.path);

    newStack.push({
      image: {
        public_id: result.public_id,
        url: result.url,
      },
      description: description,
    });
  }

  let user = await User.findByIdAndUpdate(
    req.user._id,
    { stack: newStack },
    { new: true, runValidators: true }
  );

  sendCookie(user, res, 200);
});

export const insertInStack = catchAsyncHandler(async (req, res, next) => {
  const { stackDescription } = req.body;
  const stackImage = req.file;

  if (!stackImage || !stackDescription) {
    return next(
      new ErrorHandler("Stack details are not provided properly", 400)
    );
  }

  const result = await upload(stackImage.path);

  const stackItem = {
    image: {
      public_id: result.public_id,
      url: result.url,
    },
    description: stackDescription,
  };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: { stack: stackItem },
    },
    { new: true, runValidators: true }
  );

  sendCookie(user, res, 200);
});

export const deleteInStack = catchAsyncHandler(async (req, res, next) => {
  const { public_id } = req.body;

  if (!public_id) {
    return next(new ErrorHandler("public_id not provided properly", 400));
  }

  const response = await deleteUploadedFile(public_id);

  let user = req.user;
  if (response.result === "ok") {
    user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          stack: { "image.public_id": public_id },
        },
      },
      {
        new: true,
      }
    );
  }

  sendCookie(user, res, 200);
});

export const getUser = catchAsyncHandler(async (req, res, next) => {
  const user = await User.findOne({});

  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});
