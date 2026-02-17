const Listing = require("../models/listing.js");
const { isValidObjectId } = require("mongoose");

// Index
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

//Render New Form for creat listing
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

// Show listing details
module.exports.showListing = async (req, res) => {
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
}

// Create new listing
module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the currently logged-in user
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
}

// Render Edit Form for listing
module.exports.renderEditForm = async (req, res) => {
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
}

// Update listing details
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    await Listing.findByIdAndUpdate(id, req.body.listing);

    req.flash("success", "Listing update successfully!");
    res.redirect(`/listings/${id}`);

}

// Delete listing
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
}