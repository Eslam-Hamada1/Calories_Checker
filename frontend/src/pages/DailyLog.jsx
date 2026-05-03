import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import { searchFoods } from "../services/foodApi";
import {
  addLogEntry,
  deleteLogEntry,
  getDailyLog,
  updateLogEntry,
} from "../services/logApi";

import { useToast } from "../context/ToastContext";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

const MEAL_LABELS = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
};

function groupEntriesByMealType(entries) {
  return MEAL_TYPES.reduce((groups, mealType) => {
    groups[mealType] = entries.filter((entry) => entry.mealType === mealType);
    return groups;
  }, {});
}

function getTodayDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(now.getTime() - offset * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

function DailyLog() {
  const { showToast } = useToast();

  const [date, setDate] = useState(getTodayDate());
  const [log, setLog] = useState(null);

  const [foods, setFoods] = useState([]);
  const [foodSearch, setFoodSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [foodLoading, setFoodLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState("existing");

  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [mealType, setMealType] = useState("LUNCH");
  const [servings, setServings] = useState(1);

  const [customEntry, setCustomEntry] = useState({
    customName: "",
    servingUnit: "serving",
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
    fiberG: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const [editData, setEditData] = useState({
    customName: "",
    mealType: "SNACK",
    servings: 1,
    servingUnit: "serving",
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
    fiberG: "",
  });

  const [editBaseNutrition, setEditBaseNutrition] = useState({
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fiberG: 0,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadLog();
  }, [date]);

  async function loadLog() {
    setLoading(true);

    try {
      const data = await getDailyLog(date);
      setLog(data);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to load daily log", "danger");
    } finally {
      setLoading(false);
    }
  }

  async function loadFoods(searchValue = "") {
    setFoodLoading(true);

    try {
      const data = await searchFoods(searchValue);
      setFoods(data);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to load foods", "danger");
    } finally {
      setFoodLoading(false);
    }
  }

  function openAddModal() {
    setShowAddModal(true);
    setAddMode("existing");
    setSelectedFoodId("");
    setMealType("LUNCH");
    setServings(1);
    setFoodSearch("");

    setCustomEntry({
      customName: "",
      servingUnit: "serving",
      calories: "",
      proteinG: "",
      carbsG: "",
      fatG: "",
      fiberG: "",
    });

    loadFoods("");
  }

  function closeAddModal() {
    setShowAddModal(false);
  }

  function handleCustomChange(e) {
    setCustomEntry({
      ...customEntry,
      [e.target.name]: e.target.value,
    });
  }

  function numberOrZero(value) {
    return Number(value || 0);
  }

  function getPerServingNutrition(entry) {
    const currentServings = Number(entry.servings || 1);

    if (entry.food) {
      return {
        calories: Number(entry.food.calories || 0),
        proteinG: Number(entry.food.proteinG || 0),
        carbsG: Number(entry.food.carbsG || 0),
        fatG: Number(entry.food.fatG || 0),
        fiberG: Number(entry.food.fiberG || 0),
      };
    }

    return {
      calories: Number(entry.calories || 0) / currentServings,
      proteinG: Number(entry.proteinG || 0) / currentServings,
      carbsG: Number(entry.carbsG || 0) / currentServings,
      fatG: Number(entry.fatG || 0) / currentServings,
      fiberG: Number(entry.fiberG || 0) / currentServings,
    };
  }

  function isNegative(value) {
    return Number(value) < 0;
  }

  function validateServings(value) {
    if (!value || Number(value) <= 0) {
      showToast("Servings must be greater than 0", "danger");
      return false;
    }

    return true;
  }

  function validateNutritionFields(data) {
    const fields = ["calories", "proteinG", "carbsG", "fatG", "fiberG"];

    for (const field of fields) {
      if (data[field] !== "" && isNegative(data[field])) {
        showToast("Nutrition values cannot be negative", "danger");
        return false;
      }
    }

    return true;
  }

  async function handleAddExistingFood(e) {
    e.preventDefault();

    if (!selectedFoodId) {
      showToast("Please select a food first", "danger");
      return;
    }

    if (!validateServings(servings)) return;

    setSaving(true);

    try {
      await addLogEntry(date, {
        foodId: selectedFoodId,
        mealType,
        servings: Number(servings),
      });

      showToast("Food added to daily log");
      setShowAddModal(false);
      await loadLog();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to add food", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCustomFood(e) {
    e.preventDefault();

    if (!customEntry.customName.trim()) {
      showToast("Meal name is required", "danger");
      return;
    }

    if (!validateServings(servings)) return;
    if (!validateNutritionFields(customEntry)) return;

    setSaving(true);

    try {
      await addLogEntry(date, {
        customName: customEntry.customName.trim(),
        mealType,
        servings: Number(servings),
        servingUnit: customEntry.servingUnit || "serving",
        calories: numberOrZero(customEntry.calories),
        proteinG: numberOrZero(customEntry.proteinG),
        carbsG: numberOrZero(customEntry.carbsG),
        fatG: numberOrZero(customEntry.fatG),
        fiberG: numberOrZero(customEntry.fiberG),
      });

      showToast("Custom meal added to daily log");
      setShowAddModal(false);
      await loadLog();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to add custom meal", "danger");
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(entry) {
    setEditingEntry(entry);

    const baseNutrition = getPerServingNutrition(entry);
    setEditBaseNutrition(baseNutrition);

    setEditData({
      customName: entry.customName || entry.food?.name || "",
      mealType: entry.mealType || "SNACK",
      servings: entry.servings || 1,
      servingUnit: entry.servingUnit || "serving",
      calories: entry.calories || 0,
      proteinG: entry.proteinG || 0,
      carbsG: entry.carbsG || 0,
      fatG: entry.fatG || 0,
      fiberG: entry.fiberG || 0,
    });

    setShowEditModal(true);
  }

  function handleEditChange(e) {
    const { name, value } = e.target;

    if (name === "servings") {
      const newServings = Number(value || 0);

      setEditData({
        ...editData,
        servings: value,
        calories: Math.round(editBaseNutrition.calories * newServings),
        proteinG: Math.round(editBaseNutrition.proteinG * newServings),
        carbsG: Math.round(editBaseNutrition.carbsG * newServings),
        fatG: Math.round(editBaseNutrition.fatG * newServings),
        fiberG: Math.round(editBaseNutrition.fiberG * newServings),
      });

      return;
    }

    setEditData({
      ...editData,
      [name]: value,
    });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();

    if (!editingEntry) return;

    if (!editData.customName.trim()) {
      showToast("Meal name is required", "danger");
      return;
    }

    if (!validateServings(editData.servings)) return;
    if (!validateNutritionFields(editData)) return;

    setSaving(true);

    try {
      await updateLogEntry(editingEntry.id, {
        customName: editData.customName.trim(),
        mealType: editData.mealType,
        servings: Number(editData.servings),
        servingUnit: editData.servingUnit || "serving",
        calories: numberOrZero(editData.calories),
        proteinG: numberOrZero(editData.proteinG),
        carbsG: numberOrZero(editData.carbsG),
        fatG: numberOrZero(editData.fatG),
        fiberG: numberOrZero(editData.fiberG),
      });

      showToast("Entry updated successfully");
      setShowEditModal(false);
      await loadLog();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update entry", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicateEntry(entry) {
    try {
      if (entry.foodId) {
        await addLogEntry(date, {
          foodId: entry.foodId,
          mealType: entry.mealType,
          servings: Number(entry.servings || 1),
        });
      } else {
        await addLogEntry(date, {
          customName: entry.customName || getEntryName(entry),
          mealType: entry.mealType,
          servings: Number(entry.servings || 1),
          servingUnit: entry.servingUnit || "serving",
          calories: Number(entry.calories || 0),
          proteinG: Number(entry.proteinG || 0),
          carbsG: Number(entry.carbsG || 0),
          fatG: Number(entry.fatG || 0),
          fiberG: Number(entry.fiberG || 0),
        });
      }

      showToast("Meal duplicated successfully");
      await loadLog();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to duplicate meal", "danger");
    }
  }

  function openDeleteModal(entry) {
    setEntryToDelete(entry);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!entryToDelete) return;

    setDeleting(true);

    try {
      await deleteLogEntry(entryToDelete.id);
      showToast("Entry deleted successfully");
      setShowDeleteModal(false);
      setEntryToDelete(null);
      await loadLog();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete entry", "danger");
    } finally {
      setDeleting(false);
    }
  }

  function getEntryName(entry) {
    return entry.food?.name || entry.customName || "Food";
  }

  function sumEntries(entries = []) {
    return entries.reduce(
      (total, entry) => {
        total.calories += Number(entry.calories || 0);
        total.proteinG += Number(entry.proteinG || 0);
        total.carbsG += Number(entry.carbsG || 0);
        total.fatG += Number(entry.fatG || 0);
        total.fiberG += Number(entry.fiberG || 0);
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

  const entries = log?.entries || [];
  const totals = sumEntries(entries);
  const groupedEntries = groupEntriesByMealType(entries);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Daily Log</h2>
          <p className="text-muted mb-0">
            Track what you ate and manage your meals.
          </p>
        </div>

        <Button variant="success" onClick={openAddModal}>
          Add Meal
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={8}>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="success" className="p-2">
                  Calories: {Math.round(totals.calories)} kcal
                </Badge>

                <Badge bg="secondary" className="p-2">
                  Protein: {Math.round(totals.proteinG)}g
                </Badge>

                <Badge bg="secondary" className="p-2">
                  Carbs: {Math.round(totals.carbsG)}g
                </Badge>

                <Badge bg="secondary" className="p-2">
                  Fat: {Math.round(totals.fatG)}g
                </Badge>

                <Badge bg="secondary" className="p-2">
                  Fiber: {Math.round(totals.fiberG)}g
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="text-muted mt-3">Loading daily log...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="fw-bold">No meals logged yet</h5>
              <p className="text-muted">Add your first meal for this day.</p>
              <Button variant="success" onClick={openAddModal}>
                Add Meal
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {MEAL_TYPES.map((mealType) => {
                const mealEntries = groupedEntries[mealType];

                if (mealEntries.length === 0) {
                  return null;
                }

                const mealTotals = sumEntries(mealEntries);

                return (
                  <Card key={mealType} className="border-0 bg-light rounded-4">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h5 className="fw-bold mb-1">
                            {MEAL_LABELS[mealType]}
                          </h5>
                          <p className="text-muted small mb-0">
                            {mealEntries.length} item
                            {mealEntries.length > 1 ? "s" : ""}
                          </p>
                        </div>

                        <Badge bg="success" className="p-2">
                          {Math.round(mealTotals.calories)} kcal
                        </Badge>
                      </div>

                      <Table responsive hover className="align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Meal</th>
                            <th>Servings</th>
                            <th>Calories</th>
                            <th>Protein</th>
                            <th>Carbs</th>
                            <th>Fat</th>
                            <th></th>
                          </tr>
                        </thead>

                        <tbody>
                          {mealEntries.map((entry) => (
                            <tr key={entry.id}>
                              <td>
                                <strong>{getEntryName(entry)}</strong>
                                {entry.food?.brand && (
                                  <div className="text-muted small">
                                    {entry.food.brand}
                                  </div>
                                )}
                              </td>

                              <td>
                                {entry.servings} {entry.servingUnit}
                              </td>

                              <td>{Math.round(entry.calories)} kcal</td>
                              <td>{Math.round(entry.proteinG)}g</td>
                              <td>{Math.round(entry.carbsG)}g</td>
                              <td>{Math.round(entry.fatG)}g</td>

                              <td className="text-end">
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleDuplicateEntry(entry)}
                                >
                                  Duplicate
                                </Button>

                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => openEditModal(entry)}
                                >
                                  Edit
                                </Button>

                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => openDeleteModal(entry)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showAddModal} onHide={closeAddModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Meal</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Add Type</Form.Label>
            <Form.Select
              value={addMode}
              onChange={(e) => setAddMode(e.target.value)}
            >
              <option value="existing">Choose Existing Food</option>
              <option value="custom">Add Custom Meal</option>
            </Form.Select>
          </Form.Group>

          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Meal Type</Form.Label>
                <Form.Select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SNACK">Snack</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Servings</Form.Label>
                <Form.Control
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {addMode === "existing" ? (
            <Form onSubmit={handleAddExistingFood}>
              <Row className="g-2 mb-3">
                <Col md={9}>
                  <Form.Control
                    placeholder="Search food..."
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                  />
                </Col>

                <Col md={3}>
                  <Button
                    type="button"
                    variant="outline-success"
                    className="w-100"
                    onClick={() => loadFoods(foodSearch)}
                  >
                    Search
                  </Button>
                </Col>
              </Row>

              <Form.Group>
                <Form.Label>Select Food</Form.Label>
                <Form.Select
                  value={selectedFoodId}
                  onChange={(e) => setSelectedFoodId(e.target.value)}
                >
                  <option value="">Choose food</option>

                  {foods.map((food) => (
                    <option key={food.id} value={food.id}>
                      {food.name} - {Math.round(food.calories)} kcal /{" "}
                      {food.servingSize} {food.servingUnit}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {foodLoading && (
                <p className="text-muted small mt-2 mb-0">Loading foods...</p>
              )}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={closeAddModal}>
                  Cancel
                </Button>

                <Button type="submit" variant="success" disabled={saving}>
                  {saving ? "Adding..." : "Add to Log"}
                </Button>
              </div>
            </Form>
          ) : (
            <Form onSubmit={handleAddCustomFood}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Meal Name</Form.Label>
                    <Form.Control
                      name="customName"
                      value={customEntry.customName}
                      onChange={handleCustomChange}
                      placeholder="Homemade burger"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Serving Unit</Form.Label>
                    <Form.Control
                      name="servingUnit"
                      value={customEntry.servingUnit}
                      onChange={handleCustomChange}
                      placeholder="plate / serving / grams"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Calories</Form.Label>
                    <Form.Control
                      name="calories"
                      type="number"
                      min="0"
                      step="0.1"
                      value={customEntry.calories}
                      onChange={handleCustomChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Protein</Form.Label>
                    <Form.Control
                      name="proteinG"
                      type="number"
                      min="0"
                      step="0.1"
                      value={customEntry.proteinG}
                      onChange={handleCustomChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Carbs</Form.Label>
                    <Form.Control
                      name="carbsG"
                      type="number"
                      min="0"
                      step="0.1"
                      value={customEntry.carbsG}
                      onChange={handleCustomChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Fat</Form.Label>
                    <Form.Control
                      name="fatG"
                      type="number"
                      min="0"
                      step="0.1"
                      value={customEntry.fatG}
                      onChange={handleCustomChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Fiber</Form.Label>
                    <Form.Control
                      name="fiberG"
                      type="number"
                      min="0"
                      step="0.1"
                      value={customEntry.fiberG}
                      onChange={handleCustomChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={closeAddModal}>
                  Cancel
                </Button>

                <Button type="submit" variant="success" disabled={saving}>
                  {saving ? "Adding..." : "Add Custom Meal"}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Entry</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Meal Name</Form.Label>
                  <Form.Control
                    name="customName"
                    value={editData.customName}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Meal Type</Form.Label>
                  <Form.Select
                    name="mealType"
                    value={editData.mealType}
                    onChange={handleEditChange}
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="DINNER">Dinner</option>
                    <option value="SNACK">Snack</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Servings</Form.Label>
                  <Form.Control
                    name="servings"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={editData.servings}
                    onChange={handleEditChange}
                  />
                  <Form.Text className="text-muted">
                    Changing servings automatically updates calories and macros.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Serving Unit</Form.Label>
                  <Form.Control
                    name="servingUnit"
                    value={editData.servingUnit}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Calories</Form.Label>
                  <Form.Control
                    name="calories"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editData.calories}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Protein</Form.Label>
                  <Form.Control
                    name="proteinG"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editData.proteinG}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Carbs</Form.Label>
                  <Form.Control
                    name="carbsG"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editData.carbsG}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Fat</Form.Label>
                  <Form.Control
                    name="fatG"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editData.fatG}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label>Fiber</Form.Label>
                  <Form.Control
                    name="fiberG"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editData.fiberG}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>

            <Button type="submit" variant="success" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Meal Entry</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-1">Are you sure you want to delete this meal?</p>

          <strong>
            {entryToDelete
              ? entryToDelete.food?.name || entryToDelete.customName || "Food"
              : ""}
          </strong>

          <p className="text-muted mt-3 mb-0">
            This action cannot be undone.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DailyLog;