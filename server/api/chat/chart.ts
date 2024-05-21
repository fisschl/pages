import { formatDate, startOfDay, subDays } from "date-fns";
import { uniq, uniqBy } from "lodash-es";
import { database } from "~/server/database/postgres";

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
      user: {
        select: {
          name: true,
        },
      },
    },
  });
  const xAxis = uniqBy(
    list.map((item) => item.create_at),
    (date) => date.toDateString(),
  );
  const names = uniq(list.map((item) => item.user.name));
  const series_list = names.map((name) => ({
    name,
    data: xAxis.map(() => 0),
  }));
  list.forEach((item) => {
    const index = xAxis.findIndex((date) => {
      return date.toDateString() === item.create_at.toDateString();
    });
    const series = series_list.find((series) => {
      return series.name === item.user.name;
    });
    if (!series) return;
    series.data[index] += 1;
  });
  return {
    xAxis: xAxis.map((date) => {
      return formatDate(date, "MM-dd");
    }),
    series: series_list,
  };
});
