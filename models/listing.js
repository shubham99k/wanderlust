const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const defaultImage =
    "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNreSUyMHZhY2F0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60";

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: String,

    image: {
        filename: { type: String, default: "listingimage" },
        url: {
            type: String,
            default: defaultImage,
            set: function (v) {
                if (!v || v.trim() === "") {
                    return defaultImage;
                }
                return v;
            },
        },
    },   

    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
