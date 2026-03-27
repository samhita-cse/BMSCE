import { useState } from "react";

export function useAsyncTask(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async (...args) => {
    setLoading(true);
    setError("");

    try {
      return await asyncFn(...args);
    } catch (nextError) {
      const message = nextError?.message || "Something went wrong.";
      setError(message);
      throw nextError;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError("");

  return {
    loading,
    error,
    run,
    clearError
  };
}
