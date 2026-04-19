
export const calculateMovingAverage = (data, windowSize) => {
  if (windowSize <= 1) return data; // No smoothing needed for windowSize 1 or less
  if (windowSize > data.length) return data; // Window size cannot be larger than data length

  const smoothedData = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length - 1, i + Math.ceil(windowSize / 2) - 1);
    const window = data.slice(start, end + 1);
    const sum = window.reduce((acc, val) => acc + val, 0);
    smoothedData.push(sum / window.length);
  }
  return smoothedData;
};
