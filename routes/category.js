const express = require("express");
const route = express.Router();
const { body } = require("express-validator");
const categoryController = require("../controllers/categoryController");
//category
route.post(
  "/addCategory",
  [
    body("categoryName").notEmpty().withMessage("required"),
    body("categoryType").notEmpty().withMessage("required"),
  ],
  categoryController.addCategory
);

//subCat

route.post(
  "/subCategory",
  [
    body("catId").notEmpty().withMessage("required"),
    body("subCatName").notEmpty().withMessage("required"),
    body("subCatType").notEmpty().withMessage("required"),
  ],
  categoryController.addSubCategory
);
//subchild

route.post(
  "/subChild",
  [
    body("subCatId").notEmpty().withMessage("required"),
    body("subChildName").notEmpty().withMessage("required"),
    body("subChildType").notEmpty().withMessage("required"),
  ],
  categoryController.addSubChildCategory
);

//get all cat
route.get("/allCategories", categoryController.getCats);
//get all subcat
route.get("/allSubCategories", categoryController.getSubCats);
//get all child
route.get("/allSubChildCategories", categoryController.getChild);
module.exports = route;
