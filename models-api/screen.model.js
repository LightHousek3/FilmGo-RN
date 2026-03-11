const mongoose = require("mongoose");
const { toJSON, paginate, softDelete } = require("./plugins");

const screenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    seatCapacity: {
      type: Number,
      required: true,
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// ─── Plugins ─────────────────────────────────────────────
screenSchema.plugin(toJSON);
screenSchema.plugin(paginate);
screenSchema.plugin(softDelete);

const Screen = mongoose.model("Screen", screenSchema);

module.exports = Screen;
