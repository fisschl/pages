export const picture_key = (id: string) => {
  return `server/picture/${id}`;
};

export const picture_cdn = (id: string) => {
  const KEY = picture_key(id);
  return `https://cdn.fisschl.world/${KEY}`;
};
