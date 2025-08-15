import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import {
  createProject,
  deleteInSnapshots,
  deleteProject,
  getAllProject,
  getProject,
  insertInSnapshots,
  updateProject,
  updateSnapshots,
  updatethumbnail,
} from "../controllers/project.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route("/projects").get(getAllProject);

router.route("/project/:projectId").get(getProject);

router
  .route("/project/delete/:projectId")
  .delete(isAuthenticated, isAuthorized("admin"), deleteProject);

router
  .route("/project/update/:projectId")
  .put(isAuthenticated, isAuthorized("admin"), updateProject);

router
  .route("/project/update/thumbnail/:projectId")
  .put(
    isAuthenticated,
    isAuthorized("admin"),
    upload.single("thumbnail"),
    updatethumbnail
  );

router
  .route("/project/update/snapshots/:projectId")
  .put(
    isAuthenticated,
    isAuthorized("admin"),
    upload.array("snapshots"),
    updateSnapshots
  );

router
  .route("/project/update/snapshots/insert/:projectId")
  .put(
    isAuthenticated,
    isAuthorized("admin"),
    upload.single("snapshot"),
    insertInSnapshots
  );

router
  .route("/project/update/snapshots/delete/:projectId")
  .delete(isAuthenticated, isAuthorized("admin"), deleteInSnapshots);

router
  .route("/project/create")
  .post(
    isAuthenticated,
    isAuthorized("admin"),
    upload.fields([{ name: "thumbnail", maxCount: 1 }]),
    createProject
  );

export default router;
