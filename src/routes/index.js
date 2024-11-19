import { router as users } from "./user.js";
import { router as accounts } from "./account.js"
import { router as transactions } from "./transaction.js"
import { router as auth } from "./auth.js"
import { router as sentry } from "./debugsentry.js"
import { router as authview } from "./views/index.js";

export const configureRoutes = (app) => {
  app.use('/api/v1/users', users);
  app.use('/api/v1/accounts', accounts);
  app.use('/api/v1/transactions', transactions);
  app.use('/api/v1/auth', auth);  
  app.use('/api/v1/sentry', sentry);
  app.use('/', authview);
};