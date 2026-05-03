import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";

import {
  getProfile,
  updateProfile,
  updateProfileAvatar,
} from "../services/profileApi";

import { useToast } from "../context/ToastContext";

function Profile() {
  const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    dietGoal: "MAINTAIN",
    dailyCalorieGoal: "",
    dailyProteinGoal: "",
    dailyCarbGoal: "",
    dailyFatGoal: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfile();

      setProfile(data);
      setAvatarError(false);

      setFormData({
        age: data.age || "",
        gender: data.gender || "",
        heightCm: data.heightCm || "",
        weightKg: data.weightKg || "",
        dietGoal: data.dietGoal || "MAINTAIN",
        dailyCalorieGoal: data.dailyCalorieGoal || "",
        dailyProteinGoal: data.dailyProteinGoal || "",
        dailyCarbGoal: data.dailyCarbGoal || "",
        dailyFatGoal: data.dailyFatGoal || "",
      });
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to load profile", "danger");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    setUploadingAvatar(true);

    try {
      const updatedProfile = await updateProfileAvatar(file);

      setProfile(updatedProfile);
      setAvatarError(false);
      showToast("Profile image updated successfully");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update profile image",
        "danger"
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  function optionalNumber(value) {
    return value === "" ? null : Number(value);
  }

  function requiredNumber(value, fallback) {
    return value === "" ? fallback : Number(value);
  }

  function validateProfile() {
    const age = optionalNumber(formData.age);
    const height = optionalNumber(formData.heightCm);
    const weight = optionalNumber(formData.weightKg);
    const calories = requiredNumber(formData.dailyCalorieGoal, 2000);
    const protein = optionalNumber(formData.dailyProteinGoal);
    const carbs = optionalNumber(formData.dailyCarbGoal);
    const fat = optionalNumber(formData.dailyFatGoal);

    if (age !== null && (age < 10 || age > 120)) {
      showToast("Age must be between 10 and 120", "danger");
      return false;
    }

    if (height !== null && (height < 80 || height > 250)) {
      showToast("Height must be between 80 and 250 cm", "danger");
      return false;
    }

    if (weight !== null && (weight < 20 || weight > 300)) {
      showToast("Weight must be between 20 and 300 kg", "danger");
      return false;
    }

    if (calories <= 0) {
      showToast("Daily calorie goal must be greater than 0", "danger");
      return false;
    }

    if (
      (protein !== null && protein < 0) ||
      (carbs !== null && carbs < 0) ||
      (fat !== null && fat < 0)
    ) {
      showToast("Macro goals cannot be negative", "danger");
      return false;
    }

    return true;
  }

  function handleCancel() {
    if (!profile) return;

    setFormData({
      age: profile.age || "",
      gender: profile.gender || "",
      heightCm: profile.heightCm || "",
      weightKg: profile.weightKg || "",
      dietGoal: profile.dietGoal || "MAINTAIN",
      dailyCalorieGoal: profile.dailyCalorieGoal || "",
      dailyProteinGoal: profile.dailyProteinGoal || "",
      dailyCarbGoal: profile.dailyCarbGoal || "",
      dailyFatGoal: profile.dailyFatGoal || "",
    });

    setIsEditing(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateProfile()) {
      return;
    }

    setSaving(true);

    try {
      const updatedProfile = await updateProfile({
        age: optionalNumber(formData.age),
        gender: formData.gender,
        heightCm: optionalNumber(formData.heightCm),
        weightKg: optionalNumber(formData.weightKg),
        dietGoal: formData.dietGoal,
        dailyCalorieGoal: requiredNumber(formData.dailyCalorieGoal, 2000),
        dailyProteinGoal: optionalNumber(formData.dailyProteinGoal),
        dailyCarbGoal: optionalNumber(formData.dailyCarbGoal),
        dailyFatGoal: optionalNumber(formData.dailyFatGoal),
      });

      setProfile(updatedProfile);
      setIsEditing(false);
      showToast("Profile updated successfully");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update profile", "danger");
    } finally {
      setSaving(false);
    }
  }

  function showValue(value, suffix = "") {
    if (value === null || value === undefined || value === "") {
      return "Not set";
    }

    return `${value}${suffix}`;
  }

  function formatDietGoal(goal) {
    const goals = {
      LOSE_WEIGHT: "Lose Weight",
      MAINTAIN: "Maintain",
      GAIN_MUSCLE: "Gain Muscle",
      CUSTOM: "Custom",
    };

    return goals[goal] || "Not set";
  }

  function getAvatarLetter() {
    if (profile?.gender === "female") return "F";
    if (profile?.gender === "male") return "M";
    return "?";
  }

  function AvatarImage() {
    if (profile?.avatarUrl && !avatarError) {
      return (
        <img
          src={`${API_BASE}${profile.avatarUrl}`}
          alt="Profile"
          className="rounded-circle object-fit-cover d-block mx-auto"
          onError={() => setAvatarError(true)}
          style={{
            width: "100px",
            height: "100px",
            border: "4px solid #198754",
          }}
        />
      );
    }

    return (
      <div
        className="mx-auto d-flex align-items-center justify-content-center rounded-circle bg-success text-white fw-bold"
        style={{
          width: "100px",
          height: "100px",
          fontSize: "32px",
        }}
      >
        {getAvatarLetter()}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="text-muted mt-3">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Profile</h2>
          <p className="text-muted mb-0">
            Manage your personal details and nutrition goals.
          </p>
        </div>

        {!isEditing && (
          <Button variant="success" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm rounded-4 bg-white">
        <Card.Body className="p-4">
          {!isEditing ? (
            <Row className="g-4">
              <Col lg={4}>
                <Card className="border-0 bg-light rounded-4 h-100">
                  <Card.Body className="p-4 text-center">
                    <div className="d-flex justify-content-center mb-3">
                      <AvatarImage />
                    </div>

                    <h4 className="fw-bold mb-1">Your Profile</h4>
                    <p className="text-muted mb-4">
                      Personal health information
                    </p>

                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span className="text-muted">Age</span>
                      <strong>{showValue(profile?.age)}</strong>
                    </div>

                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span className="text-muted">Gender</span>
                      <strong className="text-capitalize">
                        {showValue(profile?.gender)}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span className="text-muted">Height</span>
                      <strong>{showValue(profile?.heightCm, " cm")}</strong>
                    </div>

                    <div className="d-flex justify-content-between py-2">
                      <span className="text-muted">Weight</span>
                      <strong>{showValue(profile?.weightKg, " kg")}</strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={8}>
                <Card className="border-0 bg-light rounded-4 h-100">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div>
                        <h4 className="fw-bold mb-1">Nutrition Goals</h4>
                        <p className="text-muted mb-0">
                          Your current daily targets and diet plan.
                        </p>
                      </div>

                      <span className="badge bg-success fs-6 px-3 py-2">
                        {formatDietGoal(profile?.dietGoal)}
                      </span>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <div className="p-3 bg-white rounded-4 shadow-sm h-100">
                          <p className="text-muted mb-1">Daily Calories</p>
                          <h3 className="fw-bold mb-0">
                            {showValue(profile?.dailyCalorieGoal, " kcal")}
                          </h3>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="p-3 bg-white rounded-4 shadow-sm h-100">
                          <p className="text-muted mb-1">Diet Goal</p>
                          <h3 className="fw-bold mb-0">
                            {formatDietGoal(profile?.dietGoal)}
                          </h3>
                        </div>
                      </Col>

                      <Col md={4}>
                        <div className="p-3 bg-white rounded-4 shadow-sm h-100">
                          <p className="text-muted mb-1">Protein</p>
                          <h4 className="fw-bold mb-0">
                            {showValue(profile?.dailyProteinGoal, "g")}
                          </h4>
                        </div>
                      </Col>

                      <Col md={4}>
                        <div className="p-3 bg-white rounded-4 shadow-sm h-100">
                          <p className="text-muted mb-1">Carbs</p>
                          <h4 className="fw-bold mb-0">
                            {showValue(profile?.dailyCarbGoal, "g")}
                          </h4>
                        </div>
                      </Col>

                      <Col md={4}>
                        <div className="p-3 bg-white rounded-4 shadow-sm h-100">
                          <p className="text-muted mb-1">Fat</p>
                          <h4 className="fw-bold mb-0">
                            {showValue(profile?.dailyFatGoal, "g")}
                          </h4>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row className="g-4">
                <Col lg={4}>
                  <Card className="border-0 bg-light rounded-4 h-100">
                    <Card.Body className="p-4 text-center">
                      <div className="d-flex justify-content-center mb-3">
                        <AvatarImage />
                      </div>

                      <Form.Label className="btn btn-outline-success btn-sm mb-0">
                        {uploadingAvatar ? "Uploading..." : "Change Image"}
                        <Form.Control
                          type="file"
                          accept="image/*"
                          hidden
                          disabled={uploadingAvatar}
                          onChange={handleAvatarChange}
                        />
                      </Form.Label>

                      <p className="text-muted small mt-3 mb-0">
                        Upload a clear profile image.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={8}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Age</Form.Label>
                        <Form.Control
                          name="age"
                          type="number"
                          min="10"
                          max="120"
                          value={formData.age}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Height</Form.Label>
                        <Form.Control
                          name="heightCm"
                          type="number"
                          min="80"
                          max="250"
                          value={formData.heightCm}
                          onChange={handleChange}
                        />
                        <Form.Text className="text-muted">
                          In centimeters
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Weight</Form.Label>
                        <Form.Control
                          name="weightKg"
                          type="number"
                          min="20"
                          max="300"
                          value={formData.weightKg}
                          onChange={handleChange}
                        />
                        <Form.Text className="text-muted">
                          In kilograms
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Diet Goal</Form.Label>
                        <Form.Select
                          name="dietGoal"
                          value={formData.dietGoal}
                          onChange={handleChange}
                        >
                          <option value="LOSE_WEIGHT">Lose Weight</option>
                          <option value="MAINTAIN">Maintain</option>
                          <option value="GAIN_MUSCLE">Gain Muscle</option>
                          <option value="CUSTOM">Custom</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Daily Calorie Goal</Form.Label>
                        <Form.Control
                          name="dailyCalorieGoal"
                          type="number"
                          min="1"
                          value={formData.dailyCalorieGoal}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Protein Goal</Form.Label>
                        <Form.Control
                          name="dailyProteinGoal"
                          type="number"
                          min="0"
                          value={formData.dailyProteinGoal}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Carbs Goal</Form.Label>
                        <Form.Control
                          name="dailyCarbGoal"
                          type="number"
                          min="0"
                          value={formData.dailyCarbGoal}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Fat Goal</Form.Label>
                        <Form.Control
                          name="dailyFatGoal"
                          type="number"
                          min="0"
                          value={formData.dailyFatGoal}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <div className="d-flex gap-2 mt-2">
                        <Button type="submit" variant="success" disabled={saving}>
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Form>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

export default Profile;