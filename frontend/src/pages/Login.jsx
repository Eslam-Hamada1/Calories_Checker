import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
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

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      await login(formData);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition direction="left">
      <Container fluid className="min-vh-100 bg-light">
        <Row className="min-vh-100">
          <Col
            lg={6}
            className="d-none d-lg-flex flex-column justify-content-center bg-success text-white p-5"
          >
            <div style={{ maxWidth: "520px" }} className="mx-auto">
              <h1 className="fw-bold display-5 mb-3">Calories Checker</h1>
              <p className="lead mb-4">
                Track your meals, analyze food images, and understand your daily
                nutrition with AI-powered calorie estimation.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="bg-white bg-opacity-25 rounded-4 p-3">
                  <h5 className="fw-bold mb-1">AI Food Recognition</h5>
                  <p className="mb-0">
                    Upload a meal image and get estimated calories, macros, and
                    food breakdown.
                  </p>
                </div>

                <div className="bg-white bg-opacity-25 rounded-4 p-3">
                  <h5 className="fw-bold mb-1">Daily Nutrition Log</h5>
                  <p className="mb-0">
                    Save meals, edit entries, and monitor calories, protein,
                    carbs, fats, and fiber.
                  </p>
                </div>

                <div className="bg-white bg-opacity-25 rounded-4 p-3">
                  <h5 className="fw-bold mb-1">Progress History</h5>
                  <p className="mb-0">
                    Review your nutrition trends over the last 7, 14, or 30 days.
                  </p>
                </div>
              </div>
            </div>
          </Col>

          <Col
            lg={6}
            className="d-flex align-items-center justify-content-center p-4"
          >
            <Card className="shadow border-0 rounded-4 w-100" style={{ maxWidth: "430px" }}>
              <Card.Body className="p-4 p-md-5">
                <h3 className="fw-bold mb-1">Welcome Back</h3>
                <p className="text-muted mb-4">
                  Login to continue tracking your meals.
                </p>

                {error && (
                  <Alert variant="danger" className="rounded-4 py-2">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
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
                      placeholder="Enter your password"
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
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </Form>

                <p className="text-center mt-4 mb-0">
                  No account?{" "}
                  <Link to="/register" className="fw-bold text-success">
                    Create one
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </PageTransition>
  );
}

export default Login;