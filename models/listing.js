const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    image: {
        filename: { type: String, default: "listingimage" },
        url: {
            type: String,
            default: "https://media.istockphoto.com/id/636484522/photo/hotel-resort-swimming-pool.jpg",
            set: (v) =>
                v === ""
                    ? "https://media.istockphoto.com/id/636484522/photo/hotel-resort-swimming-pool.jpg"
                    : v,
        }
    },
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
