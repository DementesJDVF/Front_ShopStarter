import api from "../utils/axios";

export interface ProfilePicture {
  id: string;
  image_url: string;
  public_id?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MyProfile {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "VENDEDOR" | "CLIENTE" | string;
  status: string;
  is_active: boolean;
  reputation_score: string | number;
  full_name?: string | null;
  phone_number?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  birth_date?: string | null;
  created_at: string;
  updated_at: string;
  profile_picture: ProfilePicture | null;
  editable_fields: string[];
}

export const ProfileService = {
  async getMyProfile(): Promise<MyProfile> {
    const res = await api.get("users/me/profile/");
    return res.data;
  },

  async updateMyProfile(payload: Partial<MyProfile>): Promise<MyProfile> {
    const res = await api.patch("users/me/profile/", payload);
    return res.data.user ?? res.data;
  },

  async getMyProfilePicture(): Promise<ProfilePicture | null> {
    const res = await api.get("users/me/profile-picture/");
    return res.data?.image_url ? res.data : null;
  },

  async uploadProfilePicture(file: File): Promise<ProfilePicture> {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("users/me/profile-picture/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async setProfilePictureUrl(imageUrl: string): Promise<ProfilePicture> {
    const res = await api.post("users/me/profile-picture/", { image_url: imageUrl });
    return res.data;
  },

  async deleteProfilePicture(): Promise<void> {
    await api.delete("users/me/profile-picture/");
  },
};