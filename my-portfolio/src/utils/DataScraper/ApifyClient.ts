// src/DataScraper/get_data.ts

type GetDataParams = {
  url?: string;
};

const get_data = async (
  { url = "https://www.linkedin.com/in/ch-varun/" }: GetDataParams = {}
) => {
  const actorId = "VhxlqQXRwhW8H5hNV";
  const api_token = import.meta.env.VITE_APIFY_TOKEN as string | undefined;

  if (!api_token) {
    throw new Error("APIFY token missing. Set VITE_APIFY_TOKEN in your .env (not committed).");
  }

  // Step 1: Run the actor
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${api_token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: url,
      }),
    }
  );

  const runData = await runRes.json();
  const datasetId = runData.data?.defaultDatasetId;

  if (!datasetId) throw new Error("Dataset ID not found");

  // Step 2: Wait for actor to finish
  await new Promise((resolve) => setTimeout(resolve, 10000)); // wait ~10 seconds

  // Step 3: Fetch results
  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json&token=${api_token}`
  );

  const items = await itemsRes.json();
  return items;
};

export default get_data;
