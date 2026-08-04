const http = require("http");
const { routes, baseUrl } = require("./src/routes");
const { connectDB } = require("./src/config/db");

connectDB();

const server = http.createServer((req, res) => {
  const route = routes.find(
    (r) => r.url === req.url.replace(baseUrl, "") && r.method === req.method,
  );
  if (route) {
    if (route.middleware) {
      route.middleware(req, res, () => route.handler(req, res));
    } else {
      route.handler(req, res);
    }
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
