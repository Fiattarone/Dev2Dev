const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI"); //Gets the value from the config folder

// mongoose.connect(db) <-- not what we want to do, this is old

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            // useCreateIndex: true
        });

        console.log("Connected to mongoDB.")
    } catch(err) {
        console.error(err.message);

        //kill the program
        process.exit(1)
    }
}

module.exports = connectDB;