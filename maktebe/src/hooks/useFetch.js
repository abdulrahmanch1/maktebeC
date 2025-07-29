import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetch = (url, dependencies = [], config = {}) => {
  // State to store fetched data, loading status, and any errors
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to perform data fetching when URL or dependencies change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true before fetching
      setError(null); // Clear any previous errors
      try {
        const response = await axios.get(url, config); // Make the API request
        setData(response.data); // Set the fetched data
      } catch (err) {
        setError(err); // Set error if request fails
      }
      setLoading(false); // Set loading to false after fetching (success or failure)
    };

    fetchData(); // Call the fetch function
  }, [url, ...dependencies]); // Dependencies array: re-run effect if URL or custom dependencies change

  // Return data, loading status, and error for the consuming component
  return { data, loading, error };
};

export default useFetch;
