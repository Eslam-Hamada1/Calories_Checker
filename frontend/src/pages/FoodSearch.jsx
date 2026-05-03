import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import { createFood, searchFoods } from "../services/foodApi";

function FoodSearch() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [newFood, setNewFood] = useState({
    name: "",
    brand: "",
    servingSize: 1,
    servingUnit: "serving",
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
    fiberG: "",
  });

  useEffect(() => {
    loadFoods("");
  }, []);

  async function loadFoods(searchValue) {
    setLoading(true);
    setError("");

    try {
      const data = await searchFoods(searchValue);
      setFoods(data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load foods");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadFoods(search);
  }

  function handleNewFoodChange(e) {
    setNewFood({
      ...newFood,
      [e.target.name]: e.target.value,
    });
  }

  function resetNewFoodForm() {
    setNewFood({
      name: "",
      brand: "",
      servingSize: 1,
      servingUnit: "serving",
      calories: "",
      proteinG: "",
      carbsG: "",
      fatG: "",
      fiberG: "",
    });
  }

  async function handleCreateFood(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createFood({
        name: newFood.name,
        brand: newFood.brand || null,
        servingSize: Number(newFood.servingSize || 1),
        servingUnit: newFood.servingUnit || "serving",
        calories: Number(newFood.calories || 0),
        proteinG: Number(newFood.proteinG || 0),
        carbsG: Number(newFood.carbsG || 0),
        fatG: Number(newFood.fatG || 0),
        fiberG: Number(newFood.fiberG || 0),
      });

      setMessage("Food created successfully");
      setShowModal(false);
      resetNewFoodForm();
      loadFoods(search);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create food");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Food Search</h2>
          <p className="text-muted mb-0">
            Search foods and view their nutrition information.
          </p>
        </div>

        <Button variant="success" onClick={() => setShowModal(true)}>
          Add Food
        </Button>
      </div>

      {message && (
        <Alert variant="success" className="rounded-4 py-2">
          {message}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="rounded-4 py-2">
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-3">
              <Col md={10}>
                <Form.Control
                  type="text"
                  placeholder="Search for chicken, rice, burger..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>

              <Col md={2}>
                <Button type="submit" variant="success" className="w-100">
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="text-muted mt-3">Loading foods...</p>
            </div>
          ) : foods.length === 0 ? (
            <p className="text-muted mb-0">No foods found.</p>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Serving</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fat</th>
                  <th>Fiber</th>
                </tr>
              </thead>

              <tbody>
                {foods.map((food) => (
                  <tr key={food.id}>
                    <td>
                      <strong>{food.name}</strong>
                      {food.brand && (
                        <div className="text-muted small">{food.brand}</div>
                      )}
                    </td>
                    <td>
                      {food.servingSize} {food.servingUnit}
                    </td>
                    <td>{Math.round(food.calories)} kcal</td>
                    <td>{Math.round(food.proteinG)}g</td>
                    <td>{Math.round(food.carbsG)}g</td>
                    <td>{Math.round(food.fatG)}g</td>
                    <td>{Math.round(food.fiberG)}g</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Food</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleCreateFood}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Food Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={newFood.name}
                    onChange={handleNewFoodChange}
                    placeholder="Chicken Breast"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    name="brand"
                    value={newFood.brand}
                    onChange={handleNewFoodChange}
                    placeholder="Generic"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Serving Size</Form.Label>
                  <Form.Control
                    name="servingSize"
                    type="number"
                    value={newFood.servingSize}
                    onChange={handleNewFoodChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Serving Unit</Form.Label>
                  <Form.Control
                    name="servingUnit"
                    value={newFood.servingUnit}
                    onChange={handleNewFoodChange}
                    placeholder="g / serving / plate"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Calories</Form.Label>
                  <Form.Control
                    name="calories"
                    type="number"
                    value={newFood.calories}
                    onChange={handleNewFoodChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Protein</Form.Label>
                  <Form.Control
                    name="proteinG"
                    type="number"
                    value={newFood.proteinG}
                    onChange={handleNewFoodChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Carbs</Form.Label>
                  <Form.Control
                    name="carbsG"
                    type="number"
                    value={newFood.carbsG}
                    onChange={handleNewFoodChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Fat</Form.Label>
                  <Form.Control
                    name="fatG"
                    type="number"
                    value={newFood.fatG}
                    onChange={handleNewFoodChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Fiber</Form.Label>
                  <Form.Control
                    name="fiberG"
                    type="number"
                    value={newFood.fiberG}
                    onChange={handleNewFoodChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>

            <Button type="submit" variant="success" disabled={saving}>
              {saving ? "Saving..." : "Save Food"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default FoodSearch;