const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

// ---------- DB ----------
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main()
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

// ---------- APP CONFIG ----------
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------- HELPERS ----------
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details[0].message;
        throw new ExpressError(400, msg);
    }
    next();
};

// ---------- ROUTES ----------
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

// INDEX
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    return res.render("listings/index.ejs", { allListings });
}));

// NEW (must be before :id)
app.get("/listings/new", (req, res) => {
    return res.render("listings/new.ejs");
});

// CREATE
app.post("/listings",
    validateListing,
    wrapAsync(async (req, res) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        return res.redirect("/listings");
    })
);

// SHOW
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    return res.render("listings/show.ejs", { listing });
}));

// EDIT
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    return res.render("listings/edit.ejs", { listing });
}));

// UPDATE
app.put("/listings/:id",
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            throw new ExpressError(400, "Invalid listing ID");
        }

        await Listing.findByIdAndUpdate(id, req.body.listing);
        return res.redirect(`/listings/${id}`);
    })
);

// DELETE
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ExpressError(400, "Invalid listing ID");
    }

    await Listing.findByIdAndDelete(id);
    return res.redirect("/listings");
}));

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    return res.status(statusCode).render("error.ejs", { message });
});

// ---------- SERVER ----------
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
