import app from "./app.js";

const start = async () => {
  try {
    await app.listen({
      port: 3015,
      host: "0.0.0.0"
    });

    console.log("Server running on port 3015");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();