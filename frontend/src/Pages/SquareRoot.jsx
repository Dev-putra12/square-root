import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const SquareRoot = () => {
  const [number, setNumber] = useState('');
  const [method, setMethod] = useState('');
  const [result, setResult] = useState(null);
  const [metrics, setMetrics] = useState({
    clientResponseTime: null,
    serverResponseTime: null,
    executionTime: null,
  });
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(number !== '' && method !== '');
  }, [number, method]);

  const calculateSquareRoot = async () => {
    if (!isFormValid) return;

    console.log('Calculating square root for:', number, 'using method:', method);

    const startTime = performance.now();
    let serverStartTime, serverEndTime, sqrtResult, newMetrics;

    try {
      serverStartTime = performance.now();
      const response = await fetch('http://localhost:3000/api/sqrt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
        number: parseFloat(number),
        method: method
        })
      });
      serverEndTime = performance.now();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      sqrtResult = data.result;
      newMetrics = {
        clientResponseTime: performance.now() - startTime,
        serverResponseTime: serverEndTime - serverStartTime,
        executionTime: data.executionTime,
      };
    } catch (error) {
      console.error('Error calculating square root:', error);
      sqrtResult = 'Error occurred: ' + error.message;
      newMetrics = {
        clientResponseTime: performance.now() - startTime,
        serverResponseTime: serverEndTime ? serverEndTime - serverStartTime : null,
        executionTime: null,
      };
    }

    console.log('Calculation result:', sqrtResult);
    console.log('Metrics:', newMetrics);

    setResult(sqrtResult);
    setMetrics(newMetrics);
    addToHistory(method, number, sqrtResult, newMetrics);
  };

  const addToHistory = (method, input, result, metrics) => {
    console.log('Adding to history:', { method, input, result, metrics });
    setCalculationHistory(prevHistory => [
      { method, input, result, metrics },
      ...prevHistory.slice(0, 4)
    ]);
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Square Root Calculator</h1>
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Enter a number"
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            marginBottom: '0.5rem',
            border: '1px solid #ccc'
          }}
          required
        />
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            marginBottom: '0.5rem',
            border: '1px solid #ccc'
          }}
        >
          <option value="" disabled>Select Method to Calculate</option>
          <option value="function">Local Function</option>
          <option value="api">API</option>
        </select>
        <button
          onClick={calculateSquareRoot}
          disabled={!isFormValid}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            marginBottom: '1rem', 
            backgroundColor: isFormValid ? '#4CAF50' : '#cccccc', 
            color: 'white', 
            border: 'none', 
            cursor: isFormValid ? 'pointer' : 'not-allowed' 
          }}
        >
          Calculate
        </button>
        {/* {result !== null && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Result: </strong>
            {typeof result === 'number' ? result.toFixed(6) : result}
          </div>
        )} */}
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">Method</th>
              <th className="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">Input</th>
              <th className="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">Result</th>
              <th className="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">Client Response</th>
              <th className="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">Server Response</th>
              <th className="p-3 font-bold uppercase bg-gray-200 text-gray-600 border border-gray-300 hidden lg:table-cell">Execution</th>
            </tr>
          </thead>
          <tbody>
            {calculationHistory.map((calc, index) => (
              <tr key={index} className="bg-white lg:hover:bg-gray-100 flex lg:table-row flex-row lg:flex-row flex-wrap lg:flex-no-wrap mb-10 lg:mb-0">
                <td className="w-full lg:w-auto p-3 text-gray-800 text-center border border-b block lg:table-cell relative lg:static">
                  <span className="lg:hidden absolute top-0 left-0 bg-blue-200 px-2 py-1 text-xs font-bold uppercase">Method</span>
                  {calc.method === 'function' ? 'Local Function' : 'API'}
                </td>
                <td className="w-full lg:w-auto p-3 text-gray-800 border border-b text-center block lg:table-cell relative lg:static">
                  <span className="lg:hidden absolute top-0 left-0 bg-blue-200 px-2 py-1 text-xs font-bold uppercase">Input</span>
                  {calc.input}
                </td>
                <td className="w-full lg:w-auto p-3 text-gray-800 border border-b text-center block lg:table-cell relative lg:static">
                  <span className="lg:hidden absolute top-0 left-0 bg-blue-200 px-2 py-1 text-xs font-bold uppercase">Result</span>
                  {typeof calc.result === 'number' ? calc.result.toFixed(6) : calc.result}
                </td>
                <td className="w-full lg:w-auto p-3 text-gray-800 border border-b text-center block lg:table-cell relative lg:static">
                  <span className="lg:hidden absolute top-0 left-0 bg-blue-200 px-2 py-1 text-xs font-bold uppercase">Client Response</span>
                  {calc.metrics.clientResponseTime.toFixed(2)} ms
                </td>
                <td className="w-full lg:w-auto p-3 text-gray-800 border border-b text-center block lg:table-cell relative lg:static">
                  <span className="lg:hidden absolute top-0 left-0 bg-blue-200 px-2 py-1 text-xs font-bold uppercase">Server Response</span>
                  {calc.metrics.serverResponseTime.toFixed(2)} ms
                </td>
                <td className="w-full lg:w-auto p-3 text-gray-800 border border-b text-center block lg:table-cell relative lg:static">
                  <span className="lg:hidden absolute top-0 left-0 bg-blue-200 px-2 py-1 text-xs font-bold uppercase">Execution</span>
                  <span className="rounded bg-green-400 py-1 px-3 text-xs font-bold">
                    {calc.metrics.executionTime?.toFixed(2) || 'N/A'} ms
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SquareRoot;
