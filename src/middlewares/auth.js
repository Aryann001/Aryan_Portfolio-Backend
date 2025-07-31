import catchAsyncHandler from "../utils/catchAsyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuthenticated = catchAsyncHandler(async (req, res, next) => {
  const { userToken } = req.cookies;

  if (!userToken) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }

  const decoded = jwt.verify(userToken, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);
  next();
});

export const isAuthorized =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`Unauthorized role : ${req.user.role}`, 403)
      );
    }

    next();
  };
