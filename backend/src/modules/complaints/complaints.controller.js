import prisma from "../../config/db.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import s3Client from "../../config/s3.js";
import {
  checkMultipleImages,
  cleanupS3Objects,
} from "../../utils/obscenity.util.js";

/**
 * File a new complaint
 */
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, imageKey } = req.body;

    let finalImageUrl = null;

    if (imageKey) {
      // 1. Moderate the image content using AWS Rekognition
      const { isFlagged, labels } = await checkMultipleImages(imageKey);
      if (isFlagged) {
        await cleanupS3Objects(imageKey);
        return res.status(400).json({
          success: false,
          error: "Image contains inappropriate content.",
          flags: labels,
        });
      }

      // 2. Resolve S3 public URL
      const s3BaseUrl = process.env.AWS_S3_BUCKET
        ? `https://${process.env.AWS_S3_BUCKET}.s3.ap-south-1.amazonaws.com/`
        : "https://netravaah-bucket.s3.ap-south-1.amazonaws.com/";

      finalImageUrl = imageKey.startsWith("http://") || imageKey.startsWith("https://")
        ? imageKey
        : `${s3BaseUrl}${imageKey.startsWith("complaints/") ? imageKey : `complaints/${imageKey}`}`;
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        imageUrl: finalImageUrl,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Complaint filed successfully",
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve complaints with role-based visibility, filtration, and pagination
 */
export const getComplaints = async (req, res, next) => {
  try {
    const { status, category, userId, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // Authorization scoping:
    // Administrators, Leaders, and Representatives can see any complaint (and filter by userId).
    // Regular users can only see their own complaints.
    if (["ADMINISTRATOR", "LEADER", "REPRESENTATIVE"].includes(req.user.role)) {
      if (userId) {
        where.userId = userId;
      }
    } else {
      where.userId = req.user.id;
    }

    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              preSignedUrl: true,
            },
          },
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      complaints,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Explicit route to get complaints filed by the current logged-in user
 */
export const getMyComplaints = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId: req.user.id,
    };

    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      complaints,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a single complaint by ID
 */
export const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            preSignedUrl: true,
          },
        },
      },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Regular users can only fetch their own complaints.
    if (
      !["ADMINISTRATOR", "LEADER", "REPRESENTATIVE"].includes(req.user.role) &&
      complaint.userId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to view this complaint",
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the status of a complaint (restricted to Admin, Leader, Representative)
 */
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a complaint
 */
export const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Administrators can delete any complaint.
    // Regular users can delete only their own complaint, and only if it is still "pending".
    if (req.user.role !== "ADMINISTRATOR") {
      if (complaint.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to delete this complaint",
        });
      }

      if (complaint.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Bad Request: You can only delete complaints that are still pending",
        });
      }
    }

    await prisma.complaint.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate S3 Presigned URL for image uploads
 */
export const generateComplaintUploadUrl = async (req, res, next) => {
  try {
    const { fileName, fileType } = req.body;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Only PNG, JPEG, and JPG are allowed.",
      });
    }

    const extension = path.extname(fileName);
    const key = `complaints/${crypto.randomUUID()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    const s3BaseUrl = process.env.AWS_S3_BUCKET
      ? `https://${process.env.AWS_S3_BUCKET}.s3.ap-south-1.amazonaws.com/`
      : "https://netravaah-bucket.s3.ap-south-1.amazonaws.com/";
    const publicUrl = `${s3BaseUrl}${key}`;

    res.status(200).json({
      success: true,
      key,
      uploadUrl,
      publicUrl,
    });
  } catch (error) {
    next(error);
  }
};
