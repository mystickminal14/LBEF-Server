import { PORT } from "./secrets";
import { app } from "./server";


app.listen(8000, "0.0.0.0",() => {
  console.log(`Server running on port ${PORT}`);
});