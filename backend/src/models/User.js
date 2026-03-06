const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, lowercase: true, trim: true, default: null },
    phone: { type: String, required: [true, 'Phone number is required'], unique: true, trim: true },
    password: { type: String, minlength: 6 },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);