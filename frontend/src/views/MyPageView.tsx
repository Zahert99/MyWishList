import { useTheme } from "../context/ThemContext.tsx";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.tsx";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { HomeScreen } from "../router/Router.tsx";
import CreateWishlistModal from "../components/CreateWishlistModal.tsx";
import EditUser from "../components/EditUser.tsx";
import { Moon, Sun, Plus, Lock, Globe, Edit } from "lucide-react";
import ListDetails from "../components/ListDetails.tsx";
import type { User, Wishlist } from "../types.ts";

type FilterType = "all" | "private" | "public";

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [lists, setLists] = useState<Wishlist[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [selectedList, setSelectedList] = useState<Wishlist | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    async function getExistingUser() {
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data.user);
    }

    getExistingUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function getLists() {
      const res = await fetch(`/api/wishlists/user/${user?.id ?? ""}`);
      const data: Wishlist[] = await res.json();
      setLists(data);
    }

    getLists();
  }, [user]);

  const privateLists = lists.filter((l) => l.is_private);
  const publicLists = lists.filter((l) => !l.is_private);

  const filteredLists =
    filter === "private"
      ? privateLists
      : filter === "public"
      ? publicLists
      : lists;

  return (
    <div className='page-container'>
      <div className='container'>
        <header className='header'>
          <h1>My Wishlists</h1>
          <div className='header-actions'>
            <button className='theme-toggle' onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
            <Link
              onMouseOver={() => HomeScreen.preload()}
              to={"/"}
              className='btn-primary'
              style={{ textDecoration: "none" }}
            >
              Home
            </Link>
          </div>
        </header>

        {user ? (
          <>
            <div className='user-section'>
              <div className='user-info'>
                <div className='user-name'>{user.username}</div>
                <div className='user-email'>{user.email}</div>
              </div>
              <button
                className='btn-primary'
                onClick={() => setShowEditProfile(true)}
              >
                <Edit size={20} /> Edit Profile
              </button>
              <button
                className='btn-primary'
                onClick={() => setShowCreate(true)}
              >
                <Plus size={20} />
                Create List
              </button>
            </div>

            {showEditProfile && (
              <EditUser
                isOpen={showEditProfile}
                onUpdated={(updatedUser) => {
                  setUser(updatedUser);
                  setShowEditProfile(false);
                }}
                onClose={() => setShowEditProfile(false)}
                onDeleted={() => {
                  setShowEditProfile(false);
                  logout();
                  navigate("/");
                }}
              />
            )}

            {showCreate && user && (
              <CreateWishlistModal
                user={user}
                onCreated={(list) => setLists((prev) => [...prev, list])}
                onClose={() => setShowCreate(false)}
              />
            )}

            <div className='filter-section'>
              <span className='filter-label'>Filter lists</span>
              <div className='filter-buttons'>
                <button
                  className={`filter-btn ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  All Lists
                </button>
                <button
                  className={`filter-btn ${
                    filter === "private" ? "active" : ""
                  }`}
                  onClick={() => setFilter("private")}
                >
                  <Lock size={14} /> Private
                </button>
                <button
                  className={`filter-btn ${
                    filter === "public" ? "active" : ""
                  }`}
                  onClick={() => setFilter("public")}
                >
                  <Globe size={14} /> Public
                </button>
              </div>
            </div>

            <h2 className='lists-header'>Your Lists</h2>

            <div className='list-grid'>
              {filteredLists.length === 0 ? (
                <div className='empty-state'>
                  <div className='empty-state-icon'>📋</div>
                  <p>No lists found</p>
                </div>
              ) : (
                filteredLists.map((l) => (
                  <div
                    className='list-card'
                    key={l.id}
                    onClick={() => setSelectedList(l)}
                  >
                    <div className='list-card-header'>
                      <h4 className='list-title'>{l.list_title}</h4>
                      <p>
                        Created: {new Date(l.created_at).toLocaleDateString()}
                      </p>
                      <p>
                        {l.items_count && l.items_count > 0 ? (
                          <>Items: {l.items_count}</>
                        ) : (
                          <>Inga items</>
                        )}
                      </p>
                    </div>
                    <div
                      className={`privacy-badge ${
                        l.is_private ? "badge-private" : "badge-public"
                      }`}
                    >
                      {l.is_private ? <Lock size={12} /> : <Globe size={12} />}
                      {l.is_private ? "Private" : "Public"}
                    </div>
                  </div>
                ))
              )}
              {selectedList && (
                <ListDetails
                  list={selectedList}
                  isOpen={true}
                  onUpdated={(updated) =>
                    setLists((prev) =>
                      prev.map((l) => (l.id === updated.id ? updated : l))
                    )
                  }
                  onDeleted={(id) =>
                    setLists((prev) => prev.filter((l) => l.id !== id))
                  }
                  onClose={() => setSelectedList(null)}
                />
              )}
            </div>
          </>
        ) : (
          <div className='empty-state'>
            <h3 style={{ color: "var(--error)" }}>You need to log in</h3>
          </div>
        )}
      </div>
    </div>
  );
}
