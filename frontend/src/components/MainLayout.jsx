import { Container } from "react-bootstrap";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import AppNavbar from "./AppNavbar";

function MainLayout() {
  const location = useLocation();

  return (
    <>
      <AppNavbar />

      <main className="app-page">
        <Container>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </Container>
      </main>
    </>
  );
}

export default MainLayout;