// ─── GradeSync Config ──────────────────────────────────────────────────────
// Replace these values after deploying your AWS backend (Phase 2).

const CONFIG = {
  // API Gateway base URL — fill this in after deploying
  // Example: "https://abc123xyz.execute-api.ap-south-1.amazonaws.com/prod"
  API_BASE_URL: "",

  // S3 bucket region (for display/reference only)
  AWS_REGION: "ap-south-1",

  // Set to true to use mock/demo mode (no real AWS calls)
  DEMO_MODE: true,
};

export default CONFIG;
