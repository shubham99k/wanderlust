const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");


// Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");


// DB
mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));


// APP CONFIG
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// ROUTES
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

// Listings routes
app.use("/listings", listingRouter);

// Reviews routes (nested)
app.use("/listings/:id/reviews", reviewRouter);


// ERROR HANDLER
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});


// SERVER
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
