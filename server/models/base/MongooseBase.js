import mongoose from 'mongoose';

const { Schema } = mongoose;

class MongooseBase {
  static init(collectionName, attr) {
    this.model = mongoose.model(
      collectionName,
      new Schema(attr, {
        timestamps: true,
        suppressReservedKeysWarning: true,
      })
    );
    return this.model;
  }

  static find({ where = {}, page, limit, populates = [], sort = { createdAt: -1 }, attr }) {
    const _where = { ...where };
    if (_where.deletedAt === undefined) _where.deletedAt = null;

    const query = this.model.find(_where);

    if (attr) query.select(attr);
    if (sort) query.sort(sort);

    if (Number(limit) && Number(page)) {
      // query.skip(limit * (page - 1)).limit(limit);5
      const skip = (Number(page) - 1) * Number(limit);
      query.skip(skip).limit(Number(limit));
    }

    populates.forEach(p => query.populate(p));

    return query.lean().exec();
  }

  static count({ where = {} }) {
    const _where = { ...where };
    if (_where.deletedAt === undefined) _where.deletedAt = null;

    return this.model.countDocuments(_where);
  }

  static findOne({ where = {}, populates = [], attr, sort = { createdAt: -1 } }) {
    const _where = { ...where };
    if (_where.deletedAt === undefined) _where.deletedAt = null;

    const query = this.model.findOne(_where);

    if (attr) query.select(attr);
    if (sort) query.sort(sort);
    populates.forEach(p => query.populate(p));

    return query.lean().exec();
  }

  static create({ attr = {} }) {
    return this.model.create(attr);
  }

  static update({ where = {}, attr = {} }) {
    if (Object.keys(where).length === 0) return;
    return this.model.updateOne(where, attr);
  }

  static updateMany({ where = {}, attr = {} }) {
    if (Object.keys(where).length === 0) return;
    return this.model.updateMany(where, attr);
  }

  static softDelete({ where = {} }) {
    if (Object.keys(where).length === 0) return;
    return this.model.updateMany(where, { deletedAt: new Date() });
  }

  static aggregate({ pipeline = [] }) {
    return this.model.aggregate(pipeline);
  }
}

export { MongooseBase };
