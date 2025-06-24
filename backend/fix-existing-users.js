const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixExistingUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);

    let updatedCount = 0;
    let verifiedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      const updates = {};

      // Check if user has isVerified field
      if (user.isVerified === undefined) {
        updates.isVerified = false; // Set to false for existing users
        needsUpdate = true;
        console.log(`User ${user.email} needs isVerified field`);
      }

      // Check if user has verification token fields
      if (user.emailVerificationToken === undefined) {
        updates.emailVerificationToken = null;
        needsUpdate = true;
      }

      if (user.emailVerificationExpires === undefined) {
        updates.emailVerificationExpires = null;
        needsUpdate = true;
      }

      if (user.resetPasswordToken === undefined) {
        updates.resetPasswordToken = null;
        needsUpdate = true;
      }

      if (user.resetPasswordExpires === undefined) {
        updates.resetPasswordExpires = null;
        needsUpdate = true;
      }

      // Update user if needed
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updates);
        updatedCount++;
        console.log(`Updated user: ${user.email}`);
      } else {
        if (user.isVerified) {
          verifiedCount++;
        }
        console.log(`User ${user.email} is already up to date (verified: ${user.isVerified})`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Updated users: ${updatedCount}`);
    console.log(`Already verified users: ${verifiedCount}`);
    console.log(`Unverified users: ${users.length - verifiedCount}`);

    if (updatedCount > 0) {
      console.log('\n✅ Database migration completed successfully');
    } else {
      console.log('\n✅ No updates needed - all users are up to date');
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixExistingUsers(); 