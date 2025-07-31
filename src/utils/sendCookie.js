const sendCookie = (user, res, statusCode) => {
  const token = user.getJWTToken();

  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 86400000),
    sameSite: process.env.NODE_ENV === "PRODUCTION" ? "none" : "lax",
    secure: process.env.NODE_ENV === "PRODUCTION" ? true : false,
  };

  return res.status(statusCode).cookie("userToken", token, options).json({
    success: true,
    user,
    token,
  });
};

export default sendCookie;
