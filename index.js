console.log("Hello CodeSandbox");
const http = require("http");
const { routes } = require("./routes");
const { connectDB } = require("./db");

connectDB();

const server = http.createServer((req, res) => {
  const route = routes.find(r => r.url === req.url && r.method === req.method);
  if (route) {
    route.handler(req, res);
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(8000, () => {
  console.log("Server is running on port 8000");
});

console.log("server is running");
