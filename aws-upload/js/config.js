// ─── GradeSync Config ──────────────────────────────────────────────────────
// AWS backend is live — real uploads to S3 → Lambda → DynamoDB → SNS

const CONFIG = {
  // API Gateway base URL
  API_BASE_URL: "https://q3t4kjyuna.execute-api.ap-south-1.amazonaws.com",

  // S3 bucket region
  AWS_REGION: "ap-south-1",

  // false = use real AWS calls
  DEMO_MODE: false,
};

export default CONFIG;
