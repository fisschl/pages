import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

export const show_time = (time: string) => {
  const date = parseISO(time);
  return formatDistanceToNowStrict(date, { locale: zhCN, addSuffix: true });
};
