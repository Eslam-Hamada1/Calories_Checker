import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition direction="right">
      <Container fluid className="min-vh-100 bg-light">
        <Row className="min-vh-100">
          <Col
            lg={6}
            className="d-flex align-items-center justify-content-center p-4"
          >
            <Card
              className="shadow border-0 rounded-4 w-100"
              style={{ maxWidth: "430px" }}
            >
              <Card.Body className="p-4 p-md-5">
                <h3 className="fw-bold mb-1">Create Account</h3>
                <p className="text-muted mb-4">
                  Start tracking your calories smarter.
                </p>

                {error && (
                  <Alert variant="danger" className="rounded-4 py-2">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      name="password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="success"
                    className="w-100 mt-2"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Register"}
                  </Button>
                </Form>

                <p className="text-center mt-4 mb-0">
                  Already have an account?{" "}
                  <Link to="/login" className="fw-bold text-success">
                    Login
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col
            lg={6}
            className="d-none d-lg-flex flex-column justify-content-center bg-success text-white p-5"
          >
            <div style={{ maxWidth: "520px" }} className="mx-auto">
              <h1 className="fw-bold display-5 mb-3">
                Start Smarter Tracking
              </h1>
              <p className="lead mb-4">
                Build your nutrition profile, set your goals, and use AI to
                estimate calories from food images.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="bg-white bg-opacity-25 rounded-4 p-3">
                  <h5 className="fw-bold mb-1">Personal Goals</h5>
                  <p className="mb-0">
                    Set calorie and macro goals based on your own profile.
                  </p>
                </div>

                <div className="bg-white bg-opacity-25 rounded-4 p-3">
                  <h5 className="fw-bold mb-1">Meal Logging</h5>
                  <p className="mb-0">
                    Add meals manually or from AI image analysis.
                  </p>
                </div>

                <div className="bg-white bg-opacity-25 rounded-4 p-3">
                  <h5 className="fw-bold mb-1">Progress Overview</h5>
                  <p className="mb-0">
                    See daily progress and long-term nutrition history.
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </PageTransition>
  );
}

export default Register;