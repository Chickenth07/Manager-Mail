import { MongooseBase } from "./base/MongooseBase.js";

const MailTemplate = MongooseBase.init("MailTemplate", {
  name: { type: String, required: true },        
  subject: { type: String, required: true },    
  html: { type: String, required: true },        
  description: { type: String },                 
  deletedAt: { type: Date, default: null }
});

export default MailTemplate;
