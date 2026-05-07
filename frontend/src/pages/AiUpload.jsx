import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  ProgressBar,
  Row,
  Spinner,
} from "react-bootstrap";

import {
  recognizeFoodImage,
  analyzeMealText,
  addPredictionItemToLog,
} from "../services/aiApi";

import { useToast } from "../context/ToastContext";

function getTodayDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(now.getTime() - offset * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

function AiUpload() {
  const { showToast } = useToast();

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);

  const [analysisMode, setAnalysisMode] = useState("image");

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [mealText, setMealText] = useState("");

  const [prediction, setPrediction] = useState(null);

  const [date, setDate] = useState(getTodayDate());
  const [mealType, setMealType] = useState("LUNCH");

  const [loading, setLoading] = useState(false);
  const [addingItemId, setAddingItemId] = useState(null);
  const [addingAll, setAddingAll] = useState(false);

  const [addedItemIds, setAddedItemIds] = useState([]);
  const [wholeMealAdded, setWholeMealAdded] = useState(false);

  useEffect(() => {
    function checkMobile() {
      const hasTouch = window.matchMedia("(pointer: coarse)").matches;
      const smallScreen = window.matchMedia("(max-width: 768px)").matches;

      setIsMobile(hasTouch && smallScreen);
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetResultState() {
    setPrediction(null);
    setAddedItemIds([]);
    setWholeMealAdded(false);
  }

  function handleModeChange(mode) {
    setAnalysisMode(mode);
    resetResultState();
  }

  function handleImageChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image only", "danger");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    resetResultState();

    const url = URL.createObjectURL(file);

    setPreviewUrl((oldUrl) => {
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }

      return url;
    });

    e.target.value = "";
  }

  async function handleAnalyzeImage(e) {
    e.preventDefault();

    if (!imageFile) {
      showToast("Please choose or capture an image first", "danger");
      return;
    }

    setLoading(true);

    try {
      const data = await recognizeFoodImage(imageFile);

      setPrediction(data);
      setAddedItemIds([]);
      setWholeMealAdded(false);
      showToast("Image analyzed successfully");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to analyze image",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyzeText(e) {
    e.preventDefault();

    if (!mealText.trim()) {
      showToast("Please write a meal description first", "danger");
      return;
    }

    setLoading(true);

    try {
      const data = await analyzeMealText(mealText.trim());

      setPrediction(data);
      setAddedItemIds([]);
      setWholeMealAdded(false);
      showToast("Text meal analyzed successfully");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to analyze meal text",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToLog(itemId) {
    if (!prediction?.id) return;

    if (addedItemIds.includes(itemId)) {
      showToast("This item is already added to your daily log");
      return;
    }

    setAddingItemId(itemId);

    try {
      await addPredictionItemToLog(prediction.id, itemId, {
        date,
        mealType,
        servings: 1,
      });

      setAddedItemIds((prev) => [...prev, itemId]);
      showToast("Item added to daily log successfully");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add item to log",
        "danger"
      );
    } finally {
      setAddingItemId(null);
    }
  }

  async function handleAddAllToLog() {
    if (!prediction?.id || !prediction?.items?.length) return;

    const remainingItems = prediction.items.filter(
      (item) => !addedItemIds.includes(item.id)
    );

    if (remainingItems.length === 0) {
      setWholeMealAdded(true);
      showToast("Whole meal is already added to your daily log");
      return;
    }

    setAddingAll(true);

    try {
      for (const item of remainingItems) {
        await addPredictionItemToLog(prediction.id, item.id, {
          date,
          mealType,
          servings: 1,
        });
      }

      setAddedItemIds((prev) => [
        ...prev,
        ...remainingItems.map((item) => item.id),
      ]);

      setWholeMealAdded(true);
      showToast("Whole meal added to daily log successfully");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add meal to log",
        "danger"
      );
    } finally {
      setAddingAll(false);
    }
  }

  function round(value) {
    return Math.round(Number(value || 0));
  }

  const items = prediction?.items || [];

  const mealName = prediction?.mealName || "Estimated meal";
  const totalCalories = round(prediction?.totalCalories);
  const totalMin = round(prediction?.totalMin);
  const totalMax = round(prediction?.totalMax);

  const proteinG = round(prediction?.proteinG);
  const carbsG = round(prediction?.carbsG);
  const fatG = round(prediction?.fatG);
  const fiberG = round(prediction?.fiberG);

  return (
    <>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">AI Food Recognition</h2>
        <p className="text-muted mb-0">
          Analyze meals using either a food image or a written meal description.
        </p>
      </div>

      <Row className="g-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Analyze Meal</h4>

                <ButtonGroup size="sm">
                  <Button
                    variant={
                      analysisMode === "image" ? "success" : "outline-success"
                    }
                    onClick={() => handleModeChange("image")}
                  >
                    Image
                  </Button>

                  <Button
                    variant={
                      analysisMode === "text" ? "success" : "outline-success"
                    }
                    onClick={() => handleModeChange("text")}
                  >
                    Text
                  </Button>
                </ButtonGroup>
              </div>

              {analysisMode === "image" ? (
                <Form onSubmit={handleAnalyzeImage}>
                  <Form.Group className="mb-3">
                    <Form.Label>Food Image</Form.Label>

                    {isMobile ? (
                      <>
                        <div className="d-flex gap-2">
                          <Button
                            type="button"
                            variant="outline-success"
                            className="w-50"
                            disabled={loading}
                            onClick={() => galleryInputRef.current?.click()}
                          >
                            Upload Image
                          </Button>

                          <Button
                            type="button"
                            variant="success"
                            className="w-50"
                            disabled={loading}
                            onClick={() => cameraInputRef.current?.click()}
                          >
                            Take Photo
                          </Button>
                        </div>

                        <input
                          ref={galleryInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          hidden
                        />

                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageChange}
                          hidden
                        />
                      </>
                    ) : (
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loading}
                      />
                    )}

                    {imageFile && (
                      <p className="text-muted mt-2 mb-0">
                        Selected: {imageFile.name}
                      </p>
                    )}
                  </Form.Group>

                  {previewUrl && (
                    <div className="mb-3 text-center">
                      <img
                        src={previewUrl}
                        alt="Food preview"
                        className="img-fluid rounded-4"
                        style={{
                          maxHeight: "320px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="success"
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? "Analyzing Image..." : "Analyze Image"}
                  </Button>
                </Form>
              ) : (
                <Form onSubmit={handleAnalyzeText}>
                  <Form.Group className="mb-3">
                    <Form.Label>Meal Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={7}
                      value={mealText}
                      onChange={(e) => {
                        setMealText(e.target.value);
                        resetResultState();
                      }}
                      placeholder="Example: 200 grams of rice, 250 grams grilled chicken breast, 1 tablespoon olive oil"
                    />
                    <Form.Text className="text-muted">
                      Include quantities when possible for better estimates.
                    </Form.Text>
                  </Form.Group>

                  <div className="bg-light rounded-4 p-3 mb-3">
                    <p className="fw-bold mb-2">Good examples:</p>
                    <p className="text-muted mb-1">
                      200 grams white rice, 250 grams chicken breast
                    </p>
                    <p className="text-muted mb-1">
                      2 boiled eggs, 1 banana, 50 grams oats
                    </p>
                    <p className="text-muted mb-0">
                      1 burger, medium fries, 330ml cola
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="success"
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? "Analyzing Meal..." : "Analyze Text Meal"}
                  </Button>
                </Form>
              )}

              {loading && (
                <div className="text-center mt-4">
                  <Spinner animation="border" variant="success" />
                  <p className="text-muted mt-3 mb-0">
                    {analysisMode === "image"
                      ? "We are analyzing your meal... Remember to drink water while waiting!"
                      : "We are estimating calories and macros... Feel free to stretch your legs while we work on it!"}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              {!prediction ? (
                <div className="text-center py-5">
                  <h4 className="fw-bold">No prediction yet</h4>
                  <p className="text-muted mb-0">
                    Choose image or text mode, then analyze your meal.
                  </p>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h4 className="fw-bold mb-1">{mealName}</h4>
                      <p className="text-muted mb-0">
                        Estimated range: {totalMin} – {totalMax} kcal
                      </p>
                    </div>

                    <Badge bg="success" className="fs-6 px-3 py-2">
                      {totalCalories} kcal
                    </Badge>
                  </div>

                  <Row className="g-3 mb-4">
                    <Col md={3} xs={6}>
                      <div className="bg-light rounded-4 p-3 h-100">
                        <p className="text-muted mb-1">Protein</p>
                        <h5 className="fw-bold mb-0">{proteinG}g</h5>
                      </div>
                    </Col>

                    <Col md={3} xs={6}>
                      <div className="bg-light rounded-4 p-3 h-100">
                        <p className="text-muted mb-1">Carbs</p>
                        <h5 className="fw-bold mb-0">{carbsG}g</h5>
                      </div>
                    </Col>

                    <Col md={3} xs={6}>
                      <div className="bg-light rounded-4 p-3 h-100">
                        <p className="text-muted mb-1">Fat</p>
                        <h5 className="fw-bold mb-0">{fatG}g</h5>
                      </div>
                    </Col>

                    <Col md={3} xs={6}>
                      <div className="bg-light rounded-4 p-3 h-100">
                        <p className="text-muted mb-1">Fiber</p>
                        <h5 className="fw-bold mb-0">{fiberG}g</h5>
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Add to Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>

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
                  </Row>

                  {items.length > 0 && (
                    <Button
                      variant={wholeMealAdded ? "secondary" : "success"}
                      className="w-100 mb-4"
                      disabled={addingAll || wholeMealAdded}
                      onClick={handleAddAllToLog}
                    >
                      {addingAll
                        ? "Adding Whole Meal..."
                        : wholeMealAdded
                        ? "Whole Meal Added"
                        : "Add Whole Meal to Daily Log"}
                    </Button>
                  )}

                  <h5 className="fw-bold mb-3">Detected Items</h5>

                  {items.length === 0 ? (
                    <div className="bg-light rounded-4 p-4 text-center">
                      <p className="text-muted mb-0">
                        No food items were detected.
                      </p>
                    </div>
                  ) : (
                    <Row className="g-3">
                      {items.map((item) => {
                        const isAdded = addedItemIds.includes(item.id);

                        return (
                          <Col md={12} key={item.id}>
                            <Card className="border-0 bg-light rounded-4">
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h5 className="fw-bold mb-1">
                                      {item.name}
                                    </h5>

                                    {item.percentage !== null &&
                                      item.percentage !== undefined && (
                                        <p className="text-muted small mb-0">
                                          Estimated share:{" "}
                                          {round(item.percentage)}%
                                        </p>
                                      )}
                                  </div>

                                  <Badge bg="success">
                                    {round(item.calories)} kcal
                                  </Badge>
                                </div>

                                {item.percentage !== null &&
                                  item.percentage !== undefined && (
                                    <ProgressBar
                                      now={round(item.percentage)}
                                      variant="success"
                                      className="mb-2"
                                    />
                                  )}

                                <p className="text-muted small mb-3">
                                  Range: {round(item.calorieMin)} –{" "}
                                  {round(item.calorieMax)} kcal
                                </p>

                                <Row className="g-2">
                                  <Col xs={6} md={3}>
                                    <div className="macro-box rounded-3 p-2">
                                      <small className="text-muted">
                                        Protein
                                      </small>
                                      <div className="fw-bold">
                                        {round(item.proteinG)}g
                                      </div>
                                    </div>
                                  </Col>

                                  <Col xs={6} md={3}>
                                    <div className="macro-box rounded-3 p-2">
                                      <small className="text-muted">Carbs</small>
                                      <div className="fw-bold">
                                        {round(item.carbsG)}g
                                      </div>
                                    </div>
                                  </Col>

                                  <Col xs={6} md={3}>
                                    <div className="macro-box rounded-3 p-2">
                                      <small className="text-muted">Fat</small>
                                      <div className="fw-bold">
                                        {round(item.fatG)}g
                                      </div>
                                    </div>
                                  </Col>

                                  <Col xs={6} md={3}>
                                    <div className="macro-box rounded-3 p-2">
                                      <small className="text-muted">Fiber</small>
                                      <div className="fw-bold">
                                        {round(item.fiberG)}g
                                      </div>
                                    </div>
                                  </Col>
                                </Row>

                                <Button
                                  variant={
                                    isAdded ? "secondary" : "outline-success"
                                  }
                                  className="w-100 mt-3"
                                  disabled={
                                    addingItemId === item.id ||
                                    addingAll ||
                                    isAdded
                                  }
                                  onClick={() => handleAddToLog(item.id)}
                                >
                                  {addingItemId === item.id
                                    ? "Adding..."
                                    : isAdded
                                    ? "Added"
                                    : "Add This Item to Daily Log"}
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default AiUpload;