import { useEffect, useState } from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getProfile } from "../services/profileApi";

function AppNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

  const [profile, setProfile] = useState(user?.profile || null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
        setAvatarError(false);
      } catch {
        setProfile(user?.profile || null);
      }
    }

    if (user) {
      loadProfile();
    }
  }, [user]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function getUserInitial() {
    return user?.name?.charAt(0)?.toUpperCase() || "?";
  }

  function renderAvatar() {
    if (profile?.avatarUrl && !avatarError) {
      return (
        <img
          src={`${API_BASE}${profile.avatarUrl}`}
          alt="User avatar"
          className="rounded-circle object-fit-cover"
          onError={() => setAvatarError(true)}
          style={{
            width: "34px",
            height: "34px",
            border: "2px solid white",
          }}
        />
      );
    }

    return (
      <div
        className="rounded-circle bg-light text-success d-flex align-items-center justify-content-center fw-bold"
        style={{
          width: "34px",
          height: "34px",
        }}
      >
        {getUserInitial()}
      </div>
    );
  }

  return (
    <Navbar variant="dark" expand="lg" className="shadow-sm app-navbar">
      <Container>
        <Navbar.Brand
          as={NavLink}
          to="/"
          className="fw-bold d-flex align-items-center gap-2"
        >
          PortionLens
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />

        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Dashboard
            </Nav.Link>

            <Nav.Link as={NavLink} to="/ai">
              AI Upload
            </Nav.Link>

            <Nav.Link as={NavLink} to="/log">
              Daily Log
            </Nav.Link>

            <Nav.Link as={NavLink} to="/history">
              History
            </Nav.Link>

            <Nav.Link as={NavLink} to="/profile">
              Profile
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {renderAvatar()}

            <div className="text-white small d-none d-md-block">
              <div className="fw-bold">{user?.name}</div>
              <div style={{ opacity: 0.85 }}>{user?.email}</div>
            </div>

            <Button
              type="button"
              className="theme-toggle-btn"
              size="sm"
              onClick={toggleTheme}
            >
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </Button>

            <Button
              variant="light"
              size="sm"
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;