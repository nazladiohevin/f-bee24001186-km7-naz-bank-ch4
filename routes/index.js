import { router as users } from "./user.js";
import { router as accounts } from "./account.js"
import { router as transactions } from "./transaction.js"

export const configureRoutes = (app) => {
  app.use('/api/v1/users', users);
  app.use('/api/v1/accounts', accounts);
  app.use('/api/v1/transactions', transactions);
};