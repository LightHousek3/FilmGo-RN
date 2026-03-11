const mongoose = require("mongoose");
const { toJSON, paginate, softDelete } = require("./plugins");
const { SHOWTIME_STATUS } = require("../constants");

const showtimeSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(SHOWTIME_STATUS),
      default: SHOWTIME_STATUS.UPCOMING,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// ─── Plugins ─────────────────────────────────────────────
showtimeSchema.plugin(toJSON);
showtimeSchema.plugin(paginate);
showtimeSchema.plugin(softDelete);

const Showtime = mongoose.model("Showtime", showtimeSchema);

module.exports = Showtime;
