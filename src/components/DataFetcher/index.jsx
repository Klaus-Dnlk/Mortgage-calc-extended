import React from 'react';
import { CircularProgress, Alert, Box } from '@mui/material';

// DataFetcher Component - Render Props Pattern Implementation
// This component demonstrates the render props pattern for sharing data fetching logic
// It handles loading, error, and success states and passes them to child components
//
// Example usage:
// <DataFetcher fetchFunction={apiCall}>
//   {({ data, loading, error, refetch }) => (
//     loading ? <Spinner /> : <DataDisplay data={data} />
//   )}
// </DataFetcher>


class DataFetcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    // Re-fetch data when fetchFunction changes
    if (prevProps.fetchFunction !== this.props.fetchFunction) {
      this.fetchData();
    }
  }

  fetchData = async () => {
    const { fetchFunction } = this.props;
    
    if (!fetchFunction) {
      console.warn('DataFetcher: fetchFunction prop is required');
      return;
    }

    this.setState({ loading: true, error: null });

    try {
      const data = await fetchFunction();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ 
        error: error.message || 'An error occurred while fetching data', 
        loading: false 
      });
    }
  };

  render() {
    const { data, loading, error } = this.state;
    const { children, showDefaultUI = true } = this.props;

    // Prepare data for render props pattern
    const renderProps = {
      data,
      loading,
      error,
      refetch: this.fetchData
    };

    // Check if children is a function for render props
    if (typeof children === 'function') {
      return children(renderProps);
    }

    // Show default loading and error states
    if (showDefaultUI) {
      if (loading) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        );
      }

      if (error) {
        return (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        );
      }
    }

    // Fallback to normal children rendering
    return children;
  }
}

export default DataFetcher; 