import type { Session } from "koishi";
import type { RequestHandler, GeneralHandler, ApprovalResponse } from "./types";

async function handleRequest(
  handler: RequestHandler,
  session: Session,
  prefer: boolean,
  isChannel: boolean
): Promise<ApprovalResponse | void> {
  return typeof handler === "number"
    ? await checkAuthority(session, handler, isChannel)
    : await useGeneralHandler(handler, session, prefer);
}

async function checkAuthority(
  session: Session,
  authority: number,
  isChannel: boolean
): Promise<ApprovalResponse | void> {
  if (isChannel) {
    const channel = await session.observeChannel(["assignee"]);
    if (channel.assignee) return [true];
  }
  const user = await session.observeUser(["authority"]);
  if (user.authority >= authority) {
    if (isChannel) {
      const channel = await session.observeChannel(["assignee"]);
      channel.assignee = session.selfId;
      await channel.$update();
    }
    return [true];
  }
}

async function useGeneralHandler(
  handler: GeneralHandler,
  session: Session,
  prefer: boolean
): Promise<ApprovalResponse | void> {
  const result = typeof handler === "function" ? await handler(session) : handler;
  if (typeof result === "string") return [prefer, result];
  if (typeof result === "boolean") return [result];
}

export { handleRequest };
