const { default: mongoose } = require("mongoose");
const db = require("../models/db");
const { validationResult } = require("express-validator");
exports.addCategory = async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let validationError = errors.array()[0].msg;
    return res.status(422).send(
      JSON.parse(
        JSON.stringify({
          status: false,
          message: validationError,
          data: null,
        })
      )
    );
  }
  try {
    const { categoryName, categoryType } = req.body;
    let doc = await db.categoryModel.create({
      categoryName: categoryName,
      categoryType: categoryType,
    });
    if (!doc) {
      return res.send(JSON.parse(JSON.stringify({ status: false })));
    }
    let catDoc = await db.categoryModel.findById(
      { _id: doc._id },
      {
        _id: 0,
        categoryId: "$_id",
        categoryName: 1,
        categoryType: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        populate: {
          path: "subCatRef",
          select: { _id: 0, subCatId: "$_id", subCatName: 1, subCatType: 1 },
        },
      }
    );
    res.send(
      JSON.parse(
        JSON.stringify({
          status: true,
          message: "category successfully added",
          data: catDoc,
        })
      )
    );
  } catch (e) {
    console.log(e);
  }
};

//sub
exports.addSubCategory = async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let validationError = errors.array()[0].msg;
    return res.status(422).send(
      JSON.parse(
        JSON.stringify({
          status: false,
          message: validationError,
          data: null,
        })
      )
    );
  }
  const { catId, subCatName, subCatType } = req.body;
  // return res.send(req.body);
  try {
    let doc = await db.subCatModel.create({
      categoryRef: mongoose.Types.ObjectId(catId),
      subCatName: subCatName,
      subCatType: subCatType,
    });
    if (!doc) {
      return res.send(JSON.parse(JSON.stringify({ status: false })));
    }
    //Update cat
    await db.categoryModel.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(catId) },
      { $addToSet: { subCatRef: doc._id } }
    );
    //Get sucat Doc
    let subCatDoc = await db.subCatModel.findById(
      { _id: doc._id },
      {
        _id: 0,
        subCatId: "$_id",
        subCatName: 1,
        subCatType: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        populate: [
          {
            path: "categoryRef",
            select: {
              _id: 0,
              categoryId: "$_id",
              categoryName: 1,
              categoryType: 1,
            },
          },
          {
            path: "subChildRef",
            select: {
              _id: 0,
              childId: "$_id",
              subChildName: 1,
              subChildType: 1,
            },
          },
        ],
      }
    );
    res.send(
      JSON.parse(
        JSON.stringify({
          status: true,
          meddage: "sub category added successfully",
          data: subCatDoc,
        })
      )
    );
  } catch (e) {
    console.log(e);
  }
};

//sub child
exports.addSubChildCategory = async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let validationError = errors.array()[0].msg;
    return res.status(422).send(
      JSON.parse(
        JSON.stringify({
          status: false,
          message: validationError,
          data: null,
        })
      )
    );
  }
  const { subCatId, subChildName, subChildType } = req.body;
  //return res.send(req.body);
  try {
    let doc = await db.subChildModel.create({
      subCatRef: mongoose.Types.ObjectId(subCatId),
      subChildName: subChildName,
      subChildType: subChildType,
    });
    if (!doc) {
      return res.send(JSON.parse(JSON.stringify({ status: false })));
    }
    await db.subCatModel.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(subCatId) },
      { $addToSet: { subChildRef: doc._id } }
    );
    //Get sucat Doc
    let childDoc = await db.subChildModel.findById(
      { _id: doc._id },
      {
        _id: 0,
        childId: "$_id",
        subChildName: 1,
        subChildType: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
      {
        populate: {
          path: "subCatRef",
          select: { _id: 0, subCatId: "$_id", subCatName: 1, subCatType: 1 },
        },
      }
    );
    res.send(
      JSON.parse(
        JSON.stringify({
          status: true,
          meddage: "childCat successfully added",
          data: childDoc,
        })
      )
    );
  } catch (e) {
    console.log(e);
  }
};

//get all categories
exports.getCats = async (req, res) => {
  try {
    let docs = await db.categoryModel.aggregate([
      {
        $match: { status: true },
      },
      {
        $lookup: {
          from: "subcategories",
          let: { subCatIds: "$subCatRef" },
          pipeline: [
            { $match: { $expr: { $and: [{ $in: ["$_id", "$$subCatIds"] }] } } },
            {
              $project: {
                _id: 0,
                subCatId: "$_id",
                subCatName: 1,
                subCatType: 1,
              },
            },
          ],
          as: "subCats",
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryName: 1,
          categoryType: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          subCats: 1,
        },
      },
    ]);
    if (!docs.length) {
      return res.send(
        JSON.parse(
          JSON.stringify({ status: true, message: "No data", data: [] })
        )
      );
    }
    res.send(
      JSON.parse(
        JSON.stringify({ status: true, message: "categorieslist", data: docs })
      )
    );
  } catch (e) {
    console.log(e);
  }
};

//get all sub categories
exports.getSubCats = async (req, res) => {
  try {
    let docs = await db.subCatModel.aggregate([
      {
        $match: { status: true },
      },
      //Category
      {
        $lookup: {
          from: "categories",
          let: { catId: "$categoryRef" },
          pipeline: [
            {
              $match: { $expr: { $and: [{ $eq: ["$_id", "$$catId"] }] } },
            },
            {
              $project: {
                _id: 0,
                categoryId: "$_id",
                categoryName: 1,
                categoryType: 1,
              },
            },
          ],
          as: "cat",
        },
      },
      { $unwind: "$cat" },
      //child
      {
        $lookup: {
          from: "subchilds",
          let: { subChildId: "$subChildRef" },
          pipeline: [
            {
              $match: { $expr: { $and: [{ $in: ["$_id", "$$subChildId"] }] } },
            },
            {
              $project: {
                _id: 0,
                childId: "$_id",
                subChildName: 1,
                subChildType: 1,
              },
            },
          ],
          as: "childs",
        },
      },
      {
        $project: {
          _id: 0,
          subCatId: "$_id",
          subCatName: 1,
          subCatType: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          cat: 1,
          childs: 1,
        },
      },
    ]);
    if (!docs.length) {
      return res.send(
        JSON.parse(
          JSON.stringify({ status: true, message: "No data", data: [] })
        )
      );
    }
    res.send(
      JSON.parse(
        JSON.stringify({
          status: true,
          message: "sub categorieslist",
          data: docs,
        })
      )
    );
  } catch (e) {
    console.log(e);
  }
};

////get all childs
exports.getChild = async (req, res) => {
  try {
    let docs = await db.subChildModel.aggregate([
      {
        $match: { status: true },
      },
      {
        $lookup: {
          from: "subcategories",
          let: { subCatIds: "$subCatRef" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$_id", "$$subCatIds"] }] } } },
            {
              $project: {
                _id: 0,
                subCatId: "$_id",
                subCatName: 1,
                subCatType: 1,
              },
            },
          ],
          as: "subCat",
        },
      },
      { $unwind: "$subCat" },
      {
        $project: {
          _id: 0,
          childId: "$_id",
          subChildName: 1,
          subChildType: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          subCat: 1,
        },
      },
    ]);
    if (!docs.length) {
      return res.send(
        JSON.parse(
          JSON.stringify({ status: true, message: "No data", data: [] })
        )
      );
    }
    res.send(
      JSON.parse(
        JSON.stringify({ status: true, message: "sub childs list", data: docs })
      )
    );
  } catch (e) {
    console.log(e);
  }
};
