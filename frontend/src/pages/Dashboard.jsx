// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, downloadReport } from '../services/apiService';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const fetchDashboard = async () => {
    try {
      const response = await getDashboard(token);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error(error);
    }
  };

  const downloadPdfReport = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await downloadReport(token);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transaction_report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error during PDF download:', error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className='flex gap-5'>
        {transactions.length > 0 && (
          <div>
            <button
              onClick={downloadPdfReport}
              className="bg-green-500 text-white p-2 rounded mb-4"
            >
              Download PDF Report
            </button>
          </div>
        )}
        <div>
          <button
            onClick={() => navigate('/payment')}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Go to Payment
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow-md overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Date</th>
              <th className="border p-2">Payment Method</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Currency</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">UTR Number</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((txn) => (
                <tr key={txn.id} className="border-b">
                  <td className="border p-2">{new Date(txn.created_at).toLocaleDateString()}</td>
                  <td className="border p-2">{txn.payment_method}</td>
                  <td className="border p-2">{txn.amount}</td>
                  <td className="border p-2">{txn.currency}</td>
                  <td className="border p-2">{txn.status}</td>
                  <td className="border p-2">{txn.utr_number}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="border p-2 text-center">
                  Nothing to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;