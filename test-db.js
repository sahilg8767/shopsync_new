const mongoose = require('mongoose');

const uri = "mongodb+srv://shopsync_user:zFli4WugztrXR6LI@shopsync.hfov3w5.mongodb.net/shopsync?retryWrites=true&w=majority&appName=shopsync";

async function test() {
    try {
        console.log("Testing connection...");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("SUCCESS! Connected successfully to the cluster.");
        process.exit(0);
    } catch (e) {
        console.error("FAILED! Real Error Output:");
        console.error(e);
        process.exit(1);
    }
}
test();
