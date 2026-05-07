import { Container, Row, Col } from "react-bootstrap";
import { FaMapMarkerAlt, FaEnvelope, FaGithub, FaLinkedinIn } from "react-icons/fa";

function Footer() {
  return (
    <footer className="app-footer">
      <Container>
        <Row className="gy-4 align-items-center">
          <Col md={6}>
            <div className="footer-info-item">
              <span className="footer-icon"><FaMapMarkerAlt /></span>
              <div>
                <h6>Alexandria, Egypt</h6>
                <p>PortionLens</p>
              </div>
            </div>

            <div className="footer-info-item">
              <span className="footer-icon"><FaEnvelope /></span>
              <div>
                <h6>Contact</h6>
                <p>eslam.hamada2026@gmail.com</p>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <h5 className="footer-title">About PortionLens</h5>
            <p className="footer-text">
              Track your meals, analyze food images, estimate calories and macros,
              and manage your daily nutrition goals in one simple dashboard.
            </p>

            <div className="footer-socials">
              <a href="https://github.com/Eslam-Hamada1" aria-label="GitHub"><FaGithub /></a>
              <a href="https://www.linkedin.com/in/eslam-hamada-720b7429b/" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </Col>
        </Row>

        <div className="footer-bottom">
          © {new Date().getFullYear()} PortionLens. Designed by{" "}
          <strong>Eslam Hamada</strong>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;