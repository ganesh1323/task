const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Categorries

const categorySchema = new Schema(
  {
    categoryName: { type: String, required: true },
    categoryType: { type: String, required: true },
    status: { type: Boolean, default: true },
    subCatRef: [{ type: mongoose.Types.ObjectId, ref: "subCategories" }],
  },
  { timestamps: true }
);

//sub
const subCatSchema = new Schema(
  {
    subCatName: { type: String, required: true },
    subCatType: { type: String, required: true },
    status: { type: Boolean, default: true },
    categoryRef: { type: mongoose.Types.ObjectId, ref: "categories" },
    subChildRef: [{ type: mongoose.Types.ObjectId, ref: "subchilds" }],
  },
  { timestamps: true }
);

//sub child
const child = new Schema(
  {
    subChildName: { type: String, required: true },
    subChildType: { type: String, required: true },
    status: { type: Boolean, default: true },
    subCatRef: { type: mongoose.Types.ObjectId, ref: "subCategories" },
  },
  { timestamps: true }
);

module.exports.categoryModel = mongoose.model("categories", categorySchema);
module.exports.subCatModel = mongoose.model("subCategories", subCatSchema);
module.exports.subChildModel = mongoose.model("subchilds", child);
