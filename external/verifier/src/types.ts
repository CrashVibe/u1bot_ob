import type { Awaitable, Session } from "koishi";
import { Context, Schema } from "koishi";

type RequestHandler = number | GeneralHandler;
type GeneralHandler = string | boolean | ((session: Session) => Awaitable<string | boolean | void>);
type ApprovalResponse = [approve: boolean, comment?: string];

interface BaseRequest {
  type: "friend" | "guild" | "guild-member";
  timestamp: number;
  status: "pending" | "processing" | "processed";
}

interface CachedRequest extends BaseRequest {
  data: Record<string, unknown>;
}

interface SessionProcess extends BaseRequest {
  session: Session;
}

type Handlers = Record<
  "friend" | "guild" | "guild-member",
  {
    handler: RequestHandler | undefined;
    prefer: boolean;
    isChannel: boolean;
    method: "handleFriendRequest" | "handleGuildRequest" | "handleGuildMemberRequest";
  }
>;

export { RequestHandler, GeneralHandler, ApprovalResponse, CachedRequest, Handlers, SessionProcess };
