import { database } from "~/server/database/postgres";
import { formatDate, startOfDay, subDays } from "date-fns";
import { groupBy, uniq } from "lodash-es";

export default defineEventHandler(async () => {
  const length = 14;
  const list = await database.ai_chat.findMany({
    where: {
      create_at: {
        gte: startOfDay(subDays(new Date(), length)),
      },
    },
    orderBy: {
      create_at: "asc",
    },
    select: {
      id: true,
      create_at: true,
      user_id: true,
    },
  });
  const date2str = (date: Date) => {
    return formatDate(date, "MM-dd");
  };
  const date_list = list.map((item) => {
    return date2str(item.create_at);
  });
  const xAxis = uniq(date_list);
  const counts = Object.values(groupBy(list, "user_id")).map((user_list) => {
    const list = xAxis.map(() => 0);
    user_list.forEach((item) => {
      const index = xAxis.findIndex((date) => {
        return date === date2str(item.create_at);
      });
      list[index]++;
    });
    return list.map((item) => Math.ceil(item / 2));
  });
  return { xAxis, counts };
});
