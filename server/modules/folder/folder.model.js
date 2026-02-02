import { MongooseBase } from "../../models/base/MongooseBase.js";

const FolderSchema = {
  folderName: {
    type: String,
    required: true,
    unique: true,
  },

  images: [
    {
      key: String,
      path: String,
      uploadedAt: Date,
    },
  ],

  deletedAt: {
    type: Date,
    default: null,
  },
};

export const FolderModel = MongooseBase.init("folders", FolderSchema);
