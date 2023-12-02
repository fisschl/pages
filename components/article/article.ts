export interface Article {
  id: string;
  name: string;
  update_time: string;
  body: string;
  _formatted?: Partial<Omit<Article, "_formatted">>;
}
