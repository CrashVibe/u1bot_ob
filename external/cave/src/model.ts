import type { Context } from "koishi";

declare module "koishi" {
  interface Tables {
    cave: CaveModel;
  }
}

export interface CaveModel {
  id: number;
  content: string;
  user_id: string;
  createdAt: Date;
  anonymous: boolean;
}

export function applyModel(ctx: Context) {
  ctx.model.extend(
    "cave",
    {
      id: { type: "unsigned" },
      user_id: { type: "string" },
      content: { type: "text" },
      createdAt: {
        type: "timestamp",
        dump: (value: Date | null) => {
          if (value === null) {
            return new Date();
          }
          return value;
        },
        load: (value: any) => {
          return new Date(value);
        }
      },
      anonymous: { type: "boolean", initial: false }
    },
    {
      primary: "id",
      autoInc: true
    }
  );
}
