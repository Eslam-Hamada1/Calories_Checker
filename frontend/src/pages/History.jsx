import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Card,
  Col,
  Form,
  ProgressBar,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import { getHistory } from "../services/dashboardApi";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

function buildFullHistory(history, days) {
  const map = {};

  history.forEach((item) => {
    const key = getDateKey(new Date(item.date));
    map[key] = item;
  });

  const result = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const key = getDateKey(date);

    result.push({
      date: key,
      totals: map[key]?.totals || {
        calories: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        fiberG: 0,
      },
    });
  }

  return result;
}

function sumHistory(history) {
  return history.reduce(
    (total, day) => {
      total.calories += Number(day.totals.calories || 0);
      total.proteinG += Number(day.totals.proteinG || 0);
      total.carbsG += Number(day.totals.carbsG || 0);
      total.fatG += Number(day.totals.fatG || 0);
      total.fiberG += Number(day.totals.fiberG || 0);
      return total;
    },
    {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
    }
  );
}

function History() {
  const [days, setDays] = useState(7);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, [days]);

  async function loadHistory() {
    setLoading(true);
    setError("");

    try {
      const data = await getHistory(days);
      const fullHistory = buildFullHistory(data, days);
      setHistory(fullHistory);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  function round(value) {
    return Math.round(Number(value || 0));
  }

  const totals = sumHistory(history);
  const averageCalories =
    history.length > 0 ? Math.round(totals.calories / history.length) : 0;

  const maxCalories = Math.max(
    ...history.map((day) => Number(day.totals.calories || 0)),
    1
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Nutrition History</h2>
          <p className="text-muted mb-0">
            Review your calorie and macro intake over time.
          </p>
        </div>

        <Form.Select
          style={{ width: "160px" }}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </Form.Select>
      </div>

      {error && (
        <Alert variant="danger" className="rounded-4 py-2">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="text-muted mt-3">Loading history...</p>
        </div>
      ) : (
        <>
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body>
                  <p className="text-muted mb-1">Average Calories</p>
                  <h3 className="fw-bold mb-0">{averageCalories} kcal</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body>
                  <p className="text-muted mb-1">Total Calories</p>
                  <h3 className="fw-bold mb-0">{round(totals.calories)} kcal</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={2}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body>
                  <p className="text-muted mb-1">Protein</p>
                  <h3 className="fw-bold mb-0">{round(totals.proteinG)}g</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={2}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body>
                  <p className="text-muted mb-1">Carbs</p>
                  <h3 className="fw-bold mb-0">{round(totals.carbsG)}g</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={2}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body>
                  <p className="text-muted mb-1">Fat</p>
                  <h3 className="fw-bold mb-0">{round(totals.fatG)}g</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-3">Calories Trend</h4>

              <div className="d-flex flex-column gap-3">
                {history.map((day) => {
                  const calories = round(day.totals.calories);
                  const percentage = Math.round((calories / maxCalories) * 100);

                  return (
                    <div key={day.date}>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">{formatDate(day.date)}</span>
                        <strong>{calories} kcal</strong>
                      </div>

                      <ProgressBar
                        now={percentage}
                        variant={calories > 0 ? "success" : "secondary"}
                      />
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Daily Breakdown</h4>
                <Badge bg="success">{days} days</Badge>
              </div>

              <Table responsive hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Calories</th>
                    <th>Protein</th>
                    <th>Carbs</th>
                    <th>Fat</th>
                    <th>Fiber</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((day) => (
                    <tr key={day.date}>
                      <td>{formatDate(day.date)}</td>
                      <td>{round(day.totals.calories)} kcal</td>
                      <td>{round(day.totals.proteinG)}g</td>
                      <td>{round(day.totals.carbsG)}g</td>
                      <td>{round(day.totals.fatG)}g</td>
                      <td>{round(day.totals.fiberG)}g</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
}

export default History;