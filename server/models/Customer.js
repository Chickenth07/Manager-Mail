import { MongooseBase } from "./base/MongooseBase.js";

class Customer extends MongooseBase {}

Customer.init("customers", {
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  phone: String,

  deletedAt: {
    type: Date,
    default: null,
  },
});

export default Customer;
