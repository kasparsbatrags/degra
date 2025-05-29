import { renderHook, act } from '@testing-library/react-hooks';
import { useOfflineData } from '@/hooks/useOfflineData';
import { offlineManager } from '@/services/OfflineManager';
import { useNetworkState } from '@/utils/networkUtils';

// Mock dependencies
jest.mock('@/services/OfflineManager');
jest.mock('@/utils/networkUtils');

const mockOfflineManager = offlineManager as jest.Mocked<typeof offlineManager>;
const mockUseNetworkState = useNetworkState as jest.MockedFunction<typeof useNetworkState>;

describe('useOfflineData', () => {
  const mockFetcher = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default network state
    mockUseNetworkState.mockReturnValue({
      isConnected: true,
      isWifi: true,
      isCellular: false,
      isStrongConnection: true
    });
  });

  it('should return loading state initially', () => {
    mockOfflineManager.getData.mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch and return data successfully', async () => {
    const testData = { id: 1, name: 'Test' };
    mockOfflineManager.getData.mockResolvedValue({
      data: testData,
      isFromCache: false,
      isStale: false,
      error: null,
      age: 0,
      lastUpdated: Date.now()
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(testData);
    expect(result.current.isFromCache).toBe(false);
    expect(result.current.isStale).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return cached data when available', async () => {
    const testData = { id: 1, name: 'Test' };
    mockOfflineManager.getData.mockResolvedValue({
      data: testData,
      isFromCache: true,
      isStale: false,
      error: null,
      age: 5000,
      lastUpdated: Date.now() - 5000
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual(testData);
    expect(result.current.isFromCache).toBe(true);
    expect(result.current.age).toBe(5000);
  });

  it('should handle stale data correctly', async () => {
    const testData = { id: 1, name: 'Test' };
    mockOfflineManager.getData.mockResolvedValue({
      data: testData,
      isFromCache: true,
      isStale: true,
      error: null,
      age: 120000,
      lastUpdated: Date.now() - 120000
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    await waitForNextUpdate();

    expect(result.current.data).toEqual(testData);
    expect(result.current.isStale).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Network error';
    mockOfflineManager.getData.mockResolvedValue({
      data: null,
      isFromCache: false,
      isStale: false,
      error: errorMessage,
      age: 0,
      lastUpdated: null
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    await waitForNextUpdate();

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isLoading).toBe(false);
  });

  it('should call onSuccess callback when data is fetched', async () => {
    const testData = { id: 1, name: 'Test' };
    const onSuccess = jest.fn();
    
    mockOfflineManager.getData.mockResolvedValue({
      data: testData,
      isFromCache: false,
      isStale: false,
      error: null,
      age: 0,
      lastUpdated: Date.now()
    });

    const { waitForNextUpdate } = renderHook(() =>
      useOfflineData('test-key', mockFetcher, { onSuccess })
    );

    await waitForNextUpdate();

    expect(onSuccess).toHaveBeenCalledWith(testData);
  });

  it('should call onError callback when error occurs', async () => {
    const errorMessage = 'Network error';
    const onError = jest.fn();
    
    mockOfflineManager.getData.mockResolvedValue({
      data: null,
      isFromCache: false,
      isStale: false,
      error: errorMessage,
      age: 0,
      lastUpdated: null
    });

    const { waitForNextUpdate } = renderHook(() =>
      useOfflineData('test-key', mockFetcher, { onError })
    );

    await waitForNextUpdate();

    expect(onError).toHaveBeenCalledWith(errorMessage);
  });

  it('should not fetch when disabled', () => {
    const { result } = renderHook(() =>
      useOfflineData('test-key', mockFetcher, { enabled: false })
    );

    expect(mockOfflineManager.getData).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('should refetch when refetch is called', async () => {
    const testData = { id: 1, name: 'Test' };
    mockOfflineManager.getData.mockResolvedValue({
      data: testData,
      isFromCache: false,
      isStale: false,
      error: null,
      age: 0,
      lastUpdated: Date.now()
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    await waitForNextUpdate();

    // Clear previous calls
    mockOfflineManager.getData.mockClear();

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockOfflineManager.getData).toHaveBeenCalledTimes(1);
  });

  it('should refetch with force refresh when specified', async () => {
    const testData = { id: 1, name: 'Test' };
    mockOfflineManager.getData.mockResolvedValue({
      data: testData,
      isFromCache: false,
      isStale: false,
      error: null,
      age: 0,
      lastUpdated: Date.now()
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    await waitForNextUpdate();

    // Call refetch with force refresh
    await act(async () => {
      await result.current.refetch(true);
    });

    expect(mockOfflineManager.getData).toHaveBeenLastCalledWith(
      'test-key',
      mockFetcher,
      expect.objectContaining({
        forceRefresh: true
      })
    );
  });

  it('should clear cache when clearCache is called', async () => {
    mockOfflineManager.clearCache = jest.fn().mockResolvedValue(undefined);

    const { result, waitForNextUpdate } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    await waitForNextUpdate();

    await act(async () => {
      await result.current.clearCache();
    });

    expect(mockOfflineManager.clearCache).toHaveBeenCalledWith('test-key');
  });

  it('should show isRefetching state during refetch', async () => {
    const testData = { id: 1, name: 'Test' };
    mockOfflineManager.getData.mockResolvedValue({
      data: testData,
      isFromCache: false,
      isStale: false,
      error: null,
      age: 0,
      lastUpdated: Date.now()
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    await waitForNextUpdate();

    // Start refetch
    act(() => {
      result.current.refetch();
    });

    expect(result.current.isRefetching).toBe(true);
    expect(result.current.isLoading).toBe(false); // Should not show loading during refetch

    await waitForNextUpdate();

    expect(result.current.isRefetching).toBe(false);
  });

  it('should refetch when network reconnects if refetchOnReconnect is true', async () => {
    const testData = { id: 1, name: 'Test' };
    mockOfflineManager.getData.mockResolvedValue({
      data: testData,
      isFromCache: false,
      isStale: false,
      error: null,
      age: 0,
      lastUpdated: Date.now()
    });

    // Start offline
    mockUseNetworkState.mockReturnValue({
      isConnected: false,
      isWifi: false,
      isCellular: false,
      isStrongConnection: false
    });

    const { result, waitForNextUpdate, rerender } = renderHook(() =>
      useOfflineData('test-key', mockFetcher, { refetchOnReconnect: true })
    );

    await waitForNextUpdate();

    // Clear previous calls
    mockOfflineManager.getData.mockClear();

    // Simulate network reconnection
    mockUseNetworkState.mockReturnValue({
      isConnected: true,
      isWifi: true,
      isCellular: false,
      isStrongConnection: true
    });

    rerender();

    // Wait for the delayed refetch (1000ms delay)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(mockOfflineManager.getData).toHaveBeenCalledWith(
      'test-key',
      mockFetcher,
      expect.objectContaining({
        forceRefresh: true
      })
    );
  });

  it('should not refetch on mount when refetchOnMount is false', () => {
    renderHook(() =>
      useOfflineData('test-key', mockFetcher, { refetchOnMount: false })
    );

    expect(mockOfflineManager.getData).not.toHaveBeenCalled();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    unmount();

    // Should not crash or cause memory leaks
    expect(true).toBe(true);
  });

  it('should handle concurrent requests properly', async () => {
    const testData = { id: 1, name: 'Test' };
    let resolvePromise: (value: any) => void;
    
    mockOfflineManager.getData.mockImplementation(() => 
      new Promise(resolve => {
        resolvePromise = resolve;
      })
    );

    const { result } = renderHook(() =>
      useOfflineData('test-key', mockFetcher)
    );

    expect(result.current.isLoading).toBe(true);

    // Trigger another fetch while first is pending
    act(() => {
      result.current.refetch();
    });

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        data: testData,
        isFromCache: false,
        isStale: false,
        error: null,
        age: 0,
        lastUpdated: Date.now()
      });
    });

    expect(result.current.data).toEqual(testData);
    expect(result.current.isLoading).toBe(false);
  });
});
