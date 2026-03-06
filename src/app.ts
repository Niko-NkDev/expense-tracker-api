import express from "express";
import cors from "cors";
import expenseRoutes from "./routes/expense.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/expenses", expenseRoutes);

export default app;