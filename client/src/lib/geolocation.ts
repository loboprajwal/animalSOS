interface GeolocationResult {
  latitude: number;
  longitude: number;
  address: string;
  error?: string;
}

export async function getCurrentLocation(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: 0,
        longitude: 0,
        address: "Location services not available",
        error: "Geolocation is not supported by your browser"
      });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use reverse geocoding to get the address
          const address = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            address
          });
        } catch (error) {
          resolve({
            latitude,
            longitude,
            address: `${latitude}, ${longitude}`,
            error: String(error)
          });
        }
      },
      (error) => {
        let errorMessage = "Unknown error";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "User denied the request for geolocation";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get user location timed out";
            break;
        }
        resolve({
          latitude: 0,
          longitude: 0,
          address: "Location services not available",
          error: errorMessage
        });
      }
    );
  });
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    // Using a free geocoding API - in a production app, you might want to use a more robust service
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Check if location is in Maharashtra
    const isInMaharashtra = 
      data.address?.state === "Maharashtra" || 
      data.display_name.includes("Maharashtra");
    
    if (!isInMaharashtra) {
      return `${data.display_name} (Note: This location may be outside Maharashtra)`;
    }
    
    return data.display_name;
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return `${latitude}, ${longitude}`;
  }
}
