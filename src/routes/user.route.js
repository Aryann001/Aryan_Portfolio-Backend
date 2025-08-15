import express from "express";
import {
  deleteInStack,
  deleteUser,
  getUser,
  insertInStack,
  login,
  logout,
  register,
  updateStack,
  updateUser,
} from "../controllers/user.controller.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/me").get(getUser);

router
  .route("/user/update")
  .put(isAuthenticated, isAuthorized("admin"), updateUser);

router
  .route("/user/update/stack/complete")
  .put(
    isAuthenticated,
    isAuthorized("admin"),
    upload.array("stackImages"),
    updateStack
  );

router
  .route("/user/update/stack/insert")
  .put(
    isAuthenticated,
    isAuthorized("admin"),
    upload.single("stackImage"),
    insertInStack
  );

router
  .route("/user/update/stack/delete")
  .delete(isAuthenticated, isAuthorized("admin"), deleteInStack);

router.route("/user/delete/:userId").delete(deleteUser);

export default router;
