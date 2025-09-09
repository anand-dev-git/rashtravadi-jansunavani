// Utility to load logo as base64 for PDF generation
export async function loadLogoAsBase64(image): Promise<string | null> {
  try {
    // In a browser environment, we can fetch the logo
    if (typeof window !== "undefined") {
      const response = await fetch(image);
      if (!response.ok) {
        console.warn("Logo not found, using placeholder");
        return null;
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    return null;
  } catch (error) {
    console.warn("Failed to load logo:", error);
    return null;
  }
}

// Fallback base64 logo (small placeholder)
export const FALLBACK_LOGO =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjk4MGI5Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UkpTPC90ZXh0Pgo8L3N2Zz4K";
