import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataFetcher from './index';

describe('DataFetcher Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render Props Pattern Flow', () => {
    it('should render children function with loading state initially', async () => {
      const mockFetchFunction = jest.fn(() => 
        new Promise(resolve => setTimeout(() => resolve(['data1', 'data2']), 100))
      );

      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && <div data-testid="data">{data.join(', ')}</div>}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      render(
        <DataFetcher fetchFunction={mockFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Initially should show loading state
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(renderProps).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
          loading: true,
          error: null,
          refetch: expect.any(Function)
        })
      );
    });

    it('should render children function with data after successful fetch', async () => {
      const mockData = ['item1', 'item2', 'item3'];
      const mockFetchFunction = jest.fn(() => Promise.resolve(mockData));

      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && (
            <div data-testid="data">
              {data.map((item, index) => (
                <div key={index} data-testid={`item-${index}`}>{item}</div>
              ))}
            </div>
          )}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      render(
        <DataFetcher fetchFunction={mockFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('data')).toBeInTheDocument();
      });

      // Verify data is displayed
      expect(screen.getByTestId('item-0')).toHaveTextContent('item1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('item2');
      expect(screen.getByTestId('item-2')).toHaveTextContent('item3');

      // Verify render props called with correct state
      expect(renderProps).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockData,
          loading: false,
          error: null,
          refetch: expect.any(Function)
        })
      );
    });

    it('should render children function with error state on fetch failure', async () => {
      const mockError = new Error('Failed to fetch data');
      const mockFetchFunction = jest.fn(() => Promise.reject(mockError));

      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && <div data-testid="data">{data.join(', ')}</div>}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      render(
        <DataFetcher fetchFunction={mockFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch data');

      // Verify render props called with error state
      expect(renderProps).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
          loading: false,
          error: 'Failed to fetch data',
          refetch: expect.any(Function)
        })
      );
    });
  });

  describe('Refetch Functionality Flow', () => {
    it('should refetch data when refetch function is called', async () => {
      const mockFetchFunction = jest.fn(() => Promise.resolve(['initial data']));
      
      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && <div data-testid="data">{data.join(', ')}</div>}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      render(
        <DataFetcher fetchFunction={mockFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Wait for initial data to load
      await waitFor(() => {
        expect(screen.getByTestId('data')).toBeInTheDocument();
      });

      // Click refetch button
      const refetchButton = screen.getByTestId('refetch');
      fireEvent.click(refetchButton);

      // Should show loading state again
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Wait for refetch to complete
      await waitFor(() => {
        expect(screen.getByTestId('data')).toBeInTheDocument();
      });

      // Verify fetch function was called twice (initial + refetch)
      expect(mockFetchFunction).toHaveBeenCalledTimes(2);
    });

    it('should handle refetch with new fetch function', async () => {
      const initialFetchFunction = jest.fn(() => Promise.resolve(['initial']));
      const newFetchFunction = jest.fn(() => Promise.resolve(['new data']));

      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && <div data-testid="data">{data.join(', ')}</div>}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      const { rerender } = render(
        <DataFetcher fetchFunction={initialFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Wait for initial data
      await waitFor(() => {
        expect(screen.getByTestId('data')).toBeInTheDocument();
      });

      // Rerender with new fetch function
      rerender(
        <DataFetcher fetchFunction={newFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Should automatically refetch with new function
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('new data');
      });

      expect(newFetchFunction).toHaveBeenCalled();
    });
  });

  describe('Default UI Flow', () => {
    it('should show default loading UI when showDefaultUI is true', async () => {
      const mockFetchFunction = jest.fn(() => 
        new Promise(resolve => setTimeout(() => resolve(['data']), 100))
      );

      render(
        <DataFetcher fetchFunction={mockFetchFunction} showDefaultUI={true}>
          <div data-testid="children">Children content</div>
        </DataFetcher>
      );

      // Should show default loading UI
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('children')).not.toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('children')).toBeInTheDocument();
      });
    });

    it('should show default error UI when fetch fails', async () => {
      const mockError = new Error('Network error');
      const mockFetchFunction = jest.fn(() => Promise.reject(mockError));

      render(
        <DataFetcher fetchFunction={mockFetchFunction} showDefaultUI={true}>
          <div data-testid="children">Children content</div>
        </DataFetcher>
      );

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      expect(screen.queryByTestId('children')).not.toBeInTheDocument();
    });

    it('should not show default UI when showDefaultUI is false', async () => {
      const mockFetchFunction = jest.fn(() => Promise.resolve(['data']));

      render(
        <DataFetcher fetchFunction={mockFetchFunction} showDefaultUI={false}>
          <div data-testid="children">Children content</div>
        </DataFetcher>
      );

      // Should not show default loading UI
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      
      // Should show children immediately
      expect(screen.getByTestId('children')).toBeInTheDocument();
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle fetch function that throws error', async () => {
      const mockFetchFunction = jest.fn(() => {
        throw new Error('Synchronous error');
      });

      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && <div data-testid="data">{data.join(', ')}</div>}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      render(
        <DataFetcher fetchFunction={mockFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Synchronous error');
    });

    it('should handle fetch function that returns undefined', async () => {
      const mockFetchFunction = jest.fn(() => Promise.resolve(undefined));

      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && <div data-testid="data">Data loaded</div>}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      render(
        <DataFetcher fetchFunction={mockFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('data')).toBeInTheDocument();
      });

      expect(screen.getByTestId('data')).toHaveTextContent('Data loaded');
    });

    it('should handle missing fetch function gracefully', async () => {
      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && <div data-testid="data">{data.join(', ')}</div>}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      render(
        <DataFetcher>
          {renderProps}
        </DataFetcher>
      );

      // Should not show loading state
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('data')).not.toBeInTheDocument();
    });
  });

  describe('Component Lifecycle Flow', () => {
    it('should fetch data on mount', async () => {
      const mockFetchFunction = jest.fn(() => Promise.resolve(['mounted data']));

      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && <div data-testid="data">{data.join(', ')}</div>}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      render(
        <DataFetcher fetchFunction={mockFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Verify fetch function was called on mount
      expect(mockFetchFunction).toHaveBeenCalledTimes(1);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('data')).toBeInTheDocument();
      });
    });

    it('should refetch when fetch function changes', async () => {
      const firstFetchFunction = jest.fn(() => Promise.resolve(['first']));
      const secondFetchFunction = jest.fn(() => Promise.resolve(['second']));

      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && <div data-testid="data">{data.join(', ')}</div>}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      const { rerender } = render(
        <DataFetcher fetchFunction={firstFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Wait for first data to load
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('first');
      });

      // Change fetch function
      rerender(
        <DataFetcher fetchFunction={secondFetchFunction}>
          {renderProps}
        </DataFetcher>
      );

      // Should refetch with new function
      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('second');
      });

      expect(firstFetchFunction).toHaveBeenCalledTimes(1);
      expect(secondFetchFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Normal Children Rendering Flow', () => {
    it('should render normal children when not using render props', async () => {
      const mockFetchFunction = jest.fn(() => Promise.resolve(['data']));

      render(
        <DataFetcher fetchFunction={mockFetchFunction} showDefaultUI={false}>
          <div data-testid="normal-children">Normal children content</div>
        </DataFetcher>
      );

      // Should render children normally
      expect(screen.getByTestId('normal-children')).toBeInTheDocument();
      expect(screen.getByTestId('normal-children')).toHaveTextContent('Normal children content');
    });

    it('should handle mixed render props and normal children', async () => {
      const mockFetchFunction = jest.fn(() => Promise.resolve(['data']));

      const renderProps = jest.fn(({ data, loading, error, refetch }) => (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {error && <div data-testid="error">{error}</div>}
          {data && <div data-testid="data">{data.join(', ')}</div>}
          <button data-testid="refetch" onClick={refetch}>Refetch</button>
        </div>
      ));

      render(
        <DataFetcher fetchFunction={mockFetchFunction}>
          {renderProps}
          <div data-testid="additional-children">Additional content</div>
        </DataFetcher>
      );

      // Should render render props result
      await waitFor(() => {
        expect(screen.getByTestId('data')).toBeInTheDocument();
      });

      // Should not render additional children (render props takes precedence)
      expect(screen.queryByTestId('additional-children')).not.toBeInTheDocument();
    });
  });
}); 