// User types
export interface User {
  id: number;
  username: string;
  firstname?: string;
  lastname?: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  password_hash?: string;
}

export interface UserWithoutPassword extends Omit<User, "password_hash"> {}

// Wishlist types
export interface Wishlist {
  id: number;
  user_id: number;
  list_title: string;
  is_private: boolean;
  created_at: string;
  username?: string | undefined;
  items_count?: number | undefined;
}

export interface CreateWishlistData {
  list_title: string;
  is_private: boolean;
}

export interface UpdateWishlistData {
  list_title: string;
  is_private: boolean;
}

// Wishlist Item types
export interface WishlistItem {
  id: number;
  wishlist_id: number;
  item_title: string;
  price?: number | null;
  product_link?: string | null;
  created_at: string;
}

export interface CreateItemData {
  item_title: string;
  price?: number | null;
  product_link?: string | null;
}

export interface UpdateItemData {
  item_title: string;
  price?: number | null;
  product_link?: string | null;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Context types
export interface AuthContextType {
  user: User | null;
  authToken: string | null;
  login: (user: User | null, token?: string) => void;
  logout: () => void;
}

export interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// API Response types
export interface ApiError {
  error: string;
}

export type Theme = "light" | "dark";

// Component Props types
export interface RouterProps {
  user: User | null;
  onLogin: (user: User | null, token?: string) => void;
  onLogout: () => void;
}

export interface LoginFormProps {
  apiBase?: string;
  onLogin: (user: User | null, token: string) => void;
  isOpen?: boolean;
  onClose: () => void;
}

export interface CreateWishlistModalProps {
  user: User;
  onClose: () => void;
  onCreated: (wishlist: Wishlist) => void;
}

export interface EditUserProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (user: User) => void;
  onDeleted: () => void;
}

export interface ListDetailsProps {
  list: Wishlist | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (wishlist: Wishlist) => void;
  onDeleted?: (id: number) => void;
  onUpdated?: (wishlist: Wishlist) => void;
}

export interface HomeViewProps {
  user: User | null;
  onLogout: () => void;
  onLogin: (user: User | null, token?: string) => void;
}

export interface MyPageViewProps {
  user?: User | null;
  onLogin?: (user: User | null, token?: string) => void;
  onLogout?: () => void;
}
