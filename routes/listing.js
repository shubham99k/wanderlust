const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner, isValidObjectId, validateListing } = require("../middleware.js");

// ROUTES

// INDEX
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// NEW
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

// CREATE
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the currently logged-in user
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
}));

//  SHOW

router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        req.flash("error", "Invalid listing ID");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: { path: "author" },
    }).populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}));


// EDIT
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        req.flash("error", "Invalid listing ID");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
}));


// UPDATE
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    await Listing.findByIdAndUpdate(id, req.body.listing);

    req.flash("success", "Listing update successfully!");
    res.redirect(`/listings/${id}`);

}));

// DELETE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
}));

module.exports = router;
