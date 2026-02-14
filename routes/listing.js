const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

// HELPERS
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
};

// ROUTES

// INDEX
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// NEW
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

// CREATE
router.post("/", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// SHOW
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show.ejs", { listing });
}));

// EDIT
router.get("/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit.ejs", { listing });
}));

// UPDATE
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
}));

// DELETE
router.delete("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports = router;
