const mongoose = require('../db');


const RoomType = {
    PRIVATE: 'private',
    PUBLIC: 'public',
};

const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: { type: String, required: true, enum: Object.values(RoomType), default: RoomType.PUBLIC },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;