const path = require("path");
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Product Service API",
    description: "Auto generate swagger docs",
    version: "1.0.0",
  },
  host: "localhost:6002",
  basePath: "/api",
  schemes: ["http", "https"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/product.routes.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);

