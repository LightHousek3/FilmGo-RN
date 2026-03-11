const mongoose = require("mongoose");
const { toJSON, paginate, softDelete } = require("./plugins");

const promotionTicketSchema = new mongoose.Schema(
  {
    typeSeat: {
      type: [String],
      enum: ["STANDARD", "VIP", "SWEETBOX"],
      default: [],
    },
    typeMovie: {
      type: [String],
      enum: ["2D", "3D"],
      default: [],
    },
    dayType: {
      type: [String],
      enum: ["WEEKDAY", "WEEKEND"],
      default: [],
    },
  },
  { _id: false },
);

const promotionServiceSchema = new mongoose.Schema(
  {
    typeService: {
      type: [String],
      enum: ["POPCORN", "DRINK", "COMBO", "OTHER"],
      default: [],
    },
  },
  { _id: false },
);

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    description: {
      type: String,
    },

    discountType: {
      type: String,
      enum: ["AMOUNT", "PERCENT"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "UPCOMING"],
      default: "UPCOMING",
    },

    imageUrl: {
      type: String,
    },

    promotionTickets: promotionTicketSchema,

    promotionServices: promotionServiceSchema,
  },
  {
    timestamps: true,
  },
);

// plugins
promotionSchema.plugin(toJSON);
promotionSchema.plugin(paginate);
promotionSchema.plugin(softDelete);

const Promotion = mongoose.model("Promotion", promotionSchema);

module.exports = Promotion;
