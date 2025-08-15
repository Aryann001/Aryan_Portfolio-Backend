import Project from "../models/project.model.js";
import catchAsyncHandler from "../utils/catchAsyncHandler.js";
import { deleteUploadedFile, upload } from "../utils/cloudinary.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const createProject = catchAsyncHandler(async (req, res, next) => {
  const inputFields = [
    "title",
    "description",
    "category",
    "keyFeatures",
    "stack",
    "githubLink",
  ];

  if (!inputFields.every((field) => field in req.body)) {
    return next(new ErrorHandler("Project all fields required", 400));
  }

  const { title, description, category, keyFeatures, stack, githubLink, live } =
    req.body;
  const { thumbnail } = req.files;

  if (!thumbnail) {
    return next(new ErrorHandler("Project all fields required", 400));
  }

  let thumbnailObj = {};
  // let snapshotsArr = [];

  const result = await upload(thumbnail[0].path);

  thumbnailObj = {
    public_id: result.public_id,
    url: result.url,
  };

  // for (let i = 0; i < snapshots.length; i++) {
  //   const response = await upload(snapshots[i].path);

  //   snapshotsArr.push({
  //     public_id: response.public_id,
  //     url: response.url,
  //   });
  // }

  const project = await Project.create({
    userId: req.user._id,
    title,
    description,
    category,
    keyFeatures,
    stack,
    thumbnail: thumbnailObj,
    githubLink,
    live: live || "",
  });

  return res.status(201).json({
    success: true,
    message: "Project created successfully",
    project,
  });
});

export const updateProject = catchAsyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  let project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler("Invalid Project ID", 400));
  }

  const inputFields = [
    "title",
    "description",
    "category",
    "keyFeatures",
    "stack",
    "githubLink",
  ];

  if (!inputFields.every((field) => field in req.body)) {
    return next(new ErrorHandler("Project all fields required", 400));
  }

  const { title, description, category, keyFeatures, stack, githubLink, live } =
    req.body;

  project = await Project.findByIdAndUpdate(
    projectId,
    {
      title,
      description,
      category,
      keyFeatures,
      stack,
      githubLink,
      live: live || "",
    },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Project updated successfully.",
    project,
  });
});

export const updatethumbnail = catchAsyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  let project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler("Invalid Project ID", 400));
  }

  const thumbnail = req.file;

  if (!thumbnail) {
    return next(new ErrorHandler("Thumbnail field required", 400));
  }

  const result = await upload(thumbnail.path);

  const thumbnailObj = {
    public_id: result.public_id,
    url: result.url,
  };

  project = await Project.findByIdAndUpdate(
    projectId,
    { thumbnail: thumbnailObj },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Thumbnail updated successfully.",
    project,
  });
});

export const updateSnapshots = catchAsyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  let project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler("Invalid Project ID", 400));
  }

  const snapshotImages = req.files;

  if (!snapshotImages) {
    return next(
      new ErrorHandler("Snapshot details are not provided properly", 400)
    );
  }

  if (project.snapshots?.length > 0) {
    for (let i = 0; i < project.snapshots?.length; i++) {
      await deleteUploadedFile(project.snapshots[i].public_id);
    }
  }

  const newSnapshots = [];

  for (let i = 0; i < snapshotImages.length; i++) {
    const image = snapshotImages[i];

    const result = await upload(image.path);

    newSnapshots.push({
      public_id: result.public_id,
      url: result.url,
    });
  }

  project = await Project.findByIdAndUpdate(
    projectId,
    { snapshots: newSnapshots },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Snapshots updated successfully.",
    project,
  });
});

export const insertInSnapshots = catchAsyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  let project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler("Invalid Project ID", 400));
  }

  const snapshotImage = req.file;

  if (!snapshotImage) {
    return next(
      new ErrorHandler("Snapshot details are not provided properly", 400)
    );
  }

  const result = await upload(snapshotImage.path);

  const snapshotItem = {
    public_id: result.public_id,
    url: result.url,
  };

  project = await Project.findByIdAndUpdate(
    projectId,
    {
      $push: { snapshots: snapshotItem },
    },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Snapshot inserted successfully.",
    project,
  });
});

export const deleteInSnapshots = catchAsyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  let project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler("Invalid Project ID", 400));
  }

  const { public_id } = req.body;

  if (!public_id) {
    return next(new ErrorHandler("public_id not provided properly", 400));
  }

  const response = await deleteUploadedFile(public_id);

  if (response.result === "ok") {
    project = await Project.findByIdAndUpdate(
      projectId,
      {
        $pull: {
          snapshots: { public_id: public_id },
        },
      },
      {
        new: true,
      }
    );
  }

  return res.status(200).json({
    success: true,
    message: "Snapshot deleted successfully.",
    project,
  });
});

export const deleteProject = catchAsyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  let project = await Project.findById(projectId);

  if (!project) {
    return next(new ErrorHandler("Invalid Project ID", 400));
  }

  await deleteUploadedFile(project.thumbnail?.public_id);

  for (let i = 0; i < project.snapshots?.length; i++) {
    await deleteUploadedFile(project.snapshots[i].public_id);
  }

  project = await Project.findByIdAndDelete(projectId);

  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
    project,
  });
});

export const getProject = catchAsyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  return res.status(200).json({
    success: true,
    project,
  });
});

export const getAllProject = catchAsyncHandler(async (req, res, next) => {
  // 1. BUILD THE FILTER QUERY OBJECT
  const queryObj = {};

  // A. Keyword search (searches title and description)
  if (req.query.keyword) {
    queryObj.$or = [
      { title: { $regex: req.query.keyword, $options: "i" } }, // 'i' for case-insensitive
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
  }

  // B. Category filter
  if (req.query.category) {
    queryObj.category = req.query.category;
  }

  // C. Stack/Technology filter
  if (req.query.stack) {
    // Finds projects where the 'stack' array includes the specified technology
    queryObj.stack = { $in: [req.query.stack] };
  }

  // 2. SETUP PAGINATION
  const page = parseInt(req.query.page, 10) || 1; // Default to page 1
  const limit = parseInt(req.query.limit, 10) || 9; // Default to 9 projects per page
  const skip = (page - 1) * limit;

  // 3. EXECUTE THE QUERIES
  // Get the total number of documents that match the filter (for frontend pagination UI)
  const totalProjects = await Project.countDocuments(queryObj);

  // Find the projects with the applied filters and pagination
  const projects = await Project.find(queryObj)
    .sort({ createdAt: -1 }) // Optional: sort by newest projects first
    .skip(skip)
    .limit(limit);

  // 4. SEND THE RESPONSE
  return res.status(200).json({
    success: true,
    totalProjects,
    totalPages: Math.ceil(totalProjects / limit),
    currentPage: page,
    projects,
  });
});
