export async function uploadFile(file: File, endpoint: string, formData: Record<string, any> = {}) {
  if (!file) {
    throw new Error("No file provided");
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.");
  }
  
  // Check file size (limit to 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File is too large. Maximum file size is 5MB.");
  }
  
  // Create form data object
  const data = new FormData();
  data.append('photo', file);
  
  // Add other form fields
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      data.append(key, String(value));
    }
  });
  
  // Send the request
  const response = await fetch(endpoint, {
    method: 'POST',
    body: data,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error: ${response.status}`);
  }
  
  return response.json();
}
