export default defineEventHandler(async (event) => {

  //   const completion = await openai.chat.completions.create({
  //     model: "gpt-4-vision-preview",
  //     messages: [
  //       {
  //         role: "user",
  //         content: [
  //           { type: "text", text: "这张图片描述了什么" },
  //           {
  //             type: "image_url",
  //             image_url: {
  //               url: "https://cdn.fisschl.world/home/01hmaea50zftf9hga1cc7ckgxf/store/01hnheff80fap9sfz0fzb1t27t.jpg",
  //             },
  //           },
  //         ],
  //       },
  //     ],
  //     stream: true,
  //     max_tokens: 2048,
  //   });
  //   let content = "";
  //   for await (const { choices } of completion) {
  //     if (!choices.length) continue;
  //     const [{ delta }] = choices;
  //     if (!delta.content) continue;
  //     content += delta.content;
  //     console.log(content);
  //   }
});
