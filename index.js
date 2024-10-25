import { ChemicalServer } from "chemicaljs";
import express from "express";

const [app, listen] = new ChemicalServer({
  default: "uv",
  uv: true,
  scramjet: false,
  meteor: false,
  rammerhead: false,
});
const port = process.env.PORT || 3000;

app.use(
  express.static("dist", {
    index: "index.html",
    extensions: ["html"],
  })
);

app.serveChemical();

app.use((res) => {
  res.status(404);
  res.send("404 Error D:" );
});

listen(port, () => {
  console.log(`Local host doin hostin stuff at http://localhost:${port}`);
});