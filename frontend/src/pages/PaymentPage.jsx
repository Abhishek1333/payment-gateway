import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiUser, FiCreditCard } from 'react-icons/fi';
import { getUserKyc, postUserKyc, patchUserKyc, processPayment } from '../services/apiService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentPage = () => {
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [aadhar, setAadhar] = useState('');
    const [pan, setPan] = useState('');
    const [isEditingKYC, setIsEditingKYC] = useState(true);
    const [isKYCUpdate, setIsKYCUpdate] = useState(false);

    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
    const [utr, setUtr] = useState('');
    const [selectedBank, setSelectedBank] = useState("");
    const [bankDetails, setBankDetails] = useState({ accountNumber: '', ifscCode: '' });
    const currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];
    const paymentMethods = ['Card', 'UPI', 'NetBanking'];
    const banks = ["SBI", "HDFC", "ICICI"];

    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchKycData = async () => {
            try {
                const response = await getUserKyc(token);
                if (response.status === 200) {
                    const data = response.data;
                    setFullName(data.full_name);
                    setDob(data.dob);
                    setAadhar(data.aadhar_number);
                    setPan(data.pan_number);
                    setIsEditingKYC(false);
                    setIsKYCUpdate(true);
                }
            } catch (error) {
                console.error('Failed to fetch KYC data:', error);
            }
        };

        fetchKycData();
    }, [token]);

    const validateKYC = () => {
        if (!fullName.match(/^[A-Za-z\s]+$/)) {
            toast.error('Full Name should contain only alphabets and spaces');
            return false;
        }
        if (!dob) {
            toast.error('Date of Birth is required');
            return false;
        }
        const dobDate = new Date(dob);
        const age = new Date().getFullYear() - dobDate.getFullYear();
        if (age < 18) {
            toast.error('You must be at least 18 years old');
            return false;
        }
        if (!aadhar.match(/^\d{12}$/)) {
            toast.error('Aadhar Number should be exactly 12 digits');
            return false;
        }
        if (!pan.match(/^[A-Z]{5}\d{4}[A-Z]$/)) {
            toast.error('PAN Number should be exactly 10 characters and follow the format ABCDE1234F');
            return false;
        }
        return true;
    };

    const handleKYCSubmit = async () => {
        if (!validateKYC()) return;

        try {
            const payload = {
                full_name: fullName,
                dob,
                aadhar_number: aadhar,
                pan_number: pan
            };
            if (isKYCUpdate) {
                const response = await patchUserKyc(token, payload);
                toast.success('KYC updated successfully!');
                setIsEditingKYC(false);
            } else {
                const response = await postUserKyc(token, payload);
                toast.success('KYC submitted successfully!');
                setIsEditingKYC(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('KYC submission failed');
        }
    };

    const validatePayment = () => {
        if (!amount || amount <= 0) {
            toast.error('Amount should be a positive number');
            return false;
        }
        if (paymentMethod === 'Card') {
            if (!cardDetails.number.match(/^\d{16}$/)) {
                toast.error('Card Number should be exactly 16 digits');
                return false;
            }
            if (!cardDetails.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
                toast.error('Expiry Date should be in the format MM/YY');
                return false;
            }
            const [month, year] = cardDetails.expiry.split('/');
            const expiryDate = new Date(`20${year}`, month - 1);
            if (expiryDate < new Date()) {
                toast.error('Card is expired');
                return false;
            }
            if (!cardDetails.cvv.match(/^\d{3}$/)) {
                toast.error('CVV should be exactly 3 digits');
                return false;
            }
        } else if (paymentMethod === 'UPI') {
            if (!utr.match(/^\d{12}$/)) {
                toast.error('UTR Number should be exactly 12 digits');
                return false;
            }
        } else if (paymentMethod === 'NetBanking') {
            if (!bankDetails.accountNumber.match(/^\d{9,18}$/)) {
                toast.error('Account Number should be between 9 and 18 digits');
                return false;
            }
            if (!bankDetails.ifscCode.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) {
                toast.error('IFSC Code should be exactly 11 characters and follow the format ABCD0123456');
                return false;
            }
        }
        return true;
    };

    const handlePaymentSubmit = async () => {
        if (!validatePayment()) return;

        try {
            const paymentData = {
                amount,
                payment_method: paymentMethod,
                currency,
                ...(paymentMethod === 'Card' && { card_details: cardDetails }),
                ...(paymentMethod === 'UPI' && { utr_number: utr }),
                ...(paymentMethod === 'NetBanking' && {
                    bank: selectedBank,
                    account_number: bankDetails.accountNumber,
                    ifsc_code: bankDetails.ifscCode
                })
            };
            const response = await processPayment(token, paymentData);
            toast.success('Payment processed successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response.data.error || "error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col">
            <ToastContainer />
            <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
                Payment Gateway
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">
                <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
                            <FiUser className="w-6 h-6" /> KYC Verification
                        </h2>
                        <button
                            onClick={() => setIsEditingKYC(!isEditingKYC)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                            <FiEdit className="w-5 h-5" />
                            <span>{isEditingKYC ? 'Cancel' : 'Edit'}</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {['Full Name', 'Date of Birth', 'Aadhar Number', 'PAN Number'].map((label, index) => (
                            <div key={index}>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    {label}
                                </label>
                                <input
                                    type={label === 'Date of Birth' ? 'date' : 'text'}
                                    className="w-full h-10 p-4 border-2 border-blue-400 rounded-lg outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    value={
                                        label === 'Full Name'
                                            ? fullName
                                            : label === 'Date of Birth'
                                                ? dob
                                                : label === 'Aadhar Number'
                                                    ? aadhar
                                                    : pan
                                    }
                                    onChange={(e) =>
                                        label === 'Full Name'
                                            ? setFullName(e.target.value)
                                            : label === 'Date of Birth'
                                                ? setDob(e.target.value)
                                                : label === 'Aadhar Number'
                                                    ? setAadhar(e.target.value)
                                                    : setPan(e.target.value)
                                    }
                                    disabled={!isEditingKYC}
                                />
                            </div>
                        ))}

                        {isEditingKYC && (
                            <button
                                onClick={handleKYCSubmit}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg transition-all duration-300 font-medium"
                            >
                                Submit KYC
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">
                        <FiCreditCard className="w-6 h-6" /> Payment Details
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Amount
                            </label>
                            <input
                                type="number"
                                className="w-full h-10 p-4 border-2 border-blue-400 rounded-lg outline-none"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <label className="block text-sm font-medium text-gray-600" >Currency:</label>
                        <div className="flex space-x-4">
                            {currencyOptions.map((cur) => (
                                <label key={cur} className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="currency"
                                        value={cur}
                                        checked={currency === cur}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="hidden"
                                    />
                                    <span className={`px-4 py-2 border-2 rounded-lg ${currency === cur ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}>{cur}</span>
                                </label>
                            ))}
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Payment Method
                            </label>
                            <div className="flex space-x-4">
                                {paymentMethods.map((method) => (
                                    <label key={method} className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method}
                                            checked={paymentMethod === method}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="hidden"
                                        />
                                        <span className={`px-4 py-2 border-2 rounded-lg ${paymentMethod === method ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}>{method}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {paymentMethod === 'Card' && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Card Number"
                                    className="w-full h-10 p-4 border-2 border-blue-400 rounded-lg outline-none"
                                    value={cardDetails.number}
                                    onChange={(e) =>
                                        setCardDetails({ ...cardDetails, number: e.target.value })
                                    }
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full h-10 p-4 border-2 border-blue-400 rounded-lg"
                                        value={cardDetails.expiry}
                                        onChange={(e) =>
                                            setCardDetails({ ...cardDetails, expiry: e.target.value })
                                        }
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVV"
                                        className="w-full h-10 p-4 border-2 border-blue-400 rounded-lg"
                                        value={cardDetails.cvv}
                                        onChange={(e) =>
                                            setCardDetails({ ...cardDetails, cvv: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'UPI' && (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <img src="http://www.pngall.com/wp-content/uploads/2/QR-Code-PNG-Images.png" alt="UPI QR Code" className="w-48 h-48" />
                                </div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">UTR Number</label>
                                <input
                                    type="text"
                                    className="w-full h-10 p-4 border-2 border-blue-400 rounded-lg outline-none"
                                    value={utr}
                                    onChange={(e) => setUtr(e.target.value)}
                                />
                            </div>
                        )}

                        {paymentMethod === 'NetBanking' && (
                            <>
                                <label className="block text-sm font-medium text-gray-600">Select Bank</label>
                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        {banks.map((bank) => (
                                            <label key={bank}>
                                                <input
                                                    type="radio"
                                                    name="bank"
                                                    value={bank}
                                                    checked={selectedBank === bank}
                                                    onChange={(e) => setSelectedBank(e.target.value)}
                                                    className="hidden"
                                                />
                                                <span
                                                    className={`px-4 py-2 border-2 rounded-lg cursor-pointer ${selectedBank === bank
                                                        ? "border-blue-500 bg-blue-100"
                                                        : "border-gray-300"
                                                        }`}
                                                >
                                                    {bank}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <label className="block text-sm font-medium text-gray-600">Account Number</label>
                                <input
                                    type="number"
                                    className="w-full h-10 p-4 border-2 border-blue-400 rounded-lg outline-none"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) =>
                                        setBankDetails({ ...bankDetails, accountNumber: e.target.value })
                                    }
                                />
                                <label className="block text-sm font-medium text-gray-600">IFSC Code</label>
                                <input
                                    type="text"
                                    className="w-full h-10 p-4 border-2 border-blue-400 rounded-lg outline-none"
                                    value={bankDetails.ifscCode}
                                    onChange={(e) =>
                                        setBankDetails({ ...bankDetails, ifscCode: e.target.value })
                                    }
                                />
                            </>
                        )}

                        <button
                            onClick={handlePaymentSubmit}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg transition-all duration-300 font-medium"
                        >
                            Process Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;