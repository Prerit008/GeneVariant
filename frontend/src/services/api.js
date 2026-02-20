// services/api.js

export const analyzePGx = async (file, drug = "") => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/process_vcf/?drug=${encodeURIComponent(drug)}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("PGx API error:", error);
    throw error;
  }
};
