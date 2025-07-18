import type { GroupDoc } from "../groups/groupModel";
import type { UserDoc } from "../users/userModel";

declare global {
  namespace Express {
    interface Request {
      user?: UserDoc;
      group?: GroupDoc;
    }
  }
}

