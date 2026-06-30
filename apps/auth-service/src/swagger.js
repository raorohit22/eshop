const swaggerAutogen = require("swagger-autogen")();


const doc = {
  info: {
    title: "Auth Service API",
    description: "Auto generate swagger docs",
    version: "1.0.0",
  },
  host: "localhost:6001",
  basePath: "/api",
  schemes: ["http", "https"],
  definitions: {
    RegisterDto: {
      $name: "Rohit",
      $email: "iamrao22@gmail.com",
      $password: "123456"
    }
  }
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.router.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);

