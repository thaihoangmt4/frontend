import axios from "axios";

export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function isInvalidLearningFlowError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 409;
}

export function getEvaluationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) {
    return "We couldn't check your answer. Check your connection and try again.";
  }

  if (error.response.status === 404) {
    return "This question is no longer available. Please return to the course and try again.";
  }

  if (error.response.status === 400) {
    return "We couldn't check that answer. Review it and try again.";
  }

  return "We couldn't check your answer. Please try again.";
}
