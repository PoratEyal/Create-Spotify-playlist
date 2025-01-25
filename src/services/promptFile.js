export const systemMessage = `
You are a skilled assistant specializing in generating Spotify playlists in valid JSON format. Adhere to the following rules:
- Always return a JSON object with the key "songs".
- The "songs" array must contain exactly 20 items, each item being an object.
- Each object in the "songs" array must include:
  - A "title" field for the song name.
  - An "artist" field for the artist's name.
- Ensure that the JSON output is properly formatted and free of errors.
- Avoid wrapping your response in any markdown, quotes, or code block formatting. Only return plain JSON.
`;

// Function to build user prompts for playlist requests
export const buildUserMessage = (theme) => {
  return `
The user is requesting a Spotify playlist. The theme for the playlist is: "${theme}". 
Your task:
- Create a JSON object with exactly 20 "songs".
- Each song must have a "title" and "artist".
- Ensure the playlist fits the theme described.
- Return valid JSON only.
  `;
};
