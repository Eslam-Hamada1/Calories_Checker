import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  ProgressBar,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getTodayDashboard } from "../services/dashboardApi";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const data = await getTodayDashboard();
      setDashboard(data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  function round(value) {
    return Math.round(Number(value || 0));
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="text-muted mt-3">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const consumed = dashboard?.consumed || {};
  const goal = dashboard?.goal || {};

  const calories = round(consumed.calories);
  const calorieGoal = round(goal.calories || 2000);

  const isOverGoal = calories > calorieGoal;
  const remaining = Math.max(calorieGoal - calories, 0);
  const overBy = Math.max(calories - calorieGoal, 0);

  const rawPercentage =
    calorieGoal > 0 ? Math.round((calories / calorieGoal) * 100) : 0;

  const progressPercentage = Math.min(rawPercentage, 100);
  const progressVariant = isOverGoal ? "danger" : "success";

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome back, {user?.name}. Here is your nutrition summary for today.
          </p>
        </div>

        <Button variant="outline-success" onClick={loadDashboard}>
          Refresh
        </Button>
      </div>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100 card-hover">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="fw-bold mb-1">Today’s Progress</h3>

                  {!isOverGoal ? (
                    <p className="text-muted mb-0">
                      You consumed {calories} out of {calorieGoal} kcal.
                    </p>
                  ) : (
                    <p className="text-danger mb-0">
                      You consumed {calories} kcal and went over your goal by{" "}
                      {overBy} kcal.
                    </p>
                  )}
                </div>

                <span
                  className={`badge ${
                    isOverGoal ? "bg-danger" : "bg-success"
                  } fs-6 px-3 py-2`}
                >
                  {rawPercentage}%
                </span>
              </div>

              <ProgressBar
                now={progressPercentage}
                label={isOverGoal ? "Over" : `${rawPercentage}%`}
                variant={progressVariant}
                className="mb-3"
              />

              <Row className="g-3">
                <Col md={4}>
                  <div className="bg-light rounded-4 p-3">
                    <p className="text-muted mb-1">Consumed</p>
                    <h3 className="fw-bold mb-0">{calories} kcal</h3>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="bg-light rounded-4 p-3">
                    <p className="text-muted mb-1">Goal</p>
                    <h3 className="fw-bold mb-0">{calorieGoal} kcal</h3>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="bg-light rounded-4 p-3">
                    <p className="text-muted mb-1">
                      {isOverGoal ? "Over Goal" : "Remaining"}
                    </p>

                    <h3
                      className={`fw-bold mb-0 ${
                        isOverGoal ? "text-danger" : ""
                      }`}
                    >
                      {isOverGoal ? overBy : remaining} kcal
                    </h3>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100 card-hover">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-3">Quick Actions</h4>

              <div className="d-grid gap-2">
                <Button variant="success" onClick={() => navigate("/ai")}>
                  Analyze Food Image
                </Button>

                <Button variant="outline-success" onClick={() => navigate("/log")}>
                  Add Meal Manually
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={() => navigate("/history")}
                >
                  View Nutrition History
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={() => navigate("/profile")}
                >
                  Update Goals
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={3} xs={6}>
          <Card className="border-0 shadow-sm rounded-4 card-hover">
            <Card.Body>
              <p className="text-muted mb-1">Protein</p>
              <h4 className="fw-bold mb-0">{round(consumed.proteinG)}g</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} xs={6}>
          <Card className="border-0 shadow-sm rounded-4 card-hover">
            <Card.Body>
              <p className="text-muted mb-1">Carbs</p>
              <h4 className="fw-bold mb-0">{round(consumed.carbsG)}g</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} xs={6}>
          <Card className="border-0 shadow-sm rounded-4 card-hover">
            <Card.Body>
              <p className="text-muted mb-1">Fat</p>
              <h4 className="fw-bold mb-0">{round(consumed.fatG)}g</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} xs={6}>
          <Card className="border-0 shadow-sm rounded-4 card-hover">
            <Card.Body>
              <p className="text-muted mb-1">Fiber</p>
              <h4 className="fw-bold mb-0">{round(consumed.fiberG)}g</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default Dashboard;