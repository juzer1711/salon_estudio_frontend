export async function uploadImage(
  file: File
): Promise<string> {

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "upload_preset",
    "roomix_unsigned"
  );

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dxvv4sqpb/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(
      "Error subiendo imagen."
    );
  }

  const data =
    await response.json();

  return data.secure_url;
}