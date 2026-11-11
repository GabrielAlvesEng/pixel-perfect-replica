export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} · SolidAuto` }, { name: "description", content: description },
    { property: "og:title", content: `${title} · SolidAuto` }, { property: "og:description", content: description },
  ],
});
