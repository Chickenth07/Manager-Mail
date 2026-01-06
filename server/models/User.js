import { MongooseBase } from "./base/MongooseBase.js";

class User extends MongooseBase {}

User.init("users", {
  name: String,

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  deletedAt: {
    type: Date,
    default: null,
  },
});

export default User;

