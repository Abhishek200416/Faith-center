import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API, useBrand } from '@/App';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, DollarSign, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const Giving = () => {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tithes & Offerings');
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const quickAmounts = [25, 50, 100, 250, 500];

  useEffect(() => {
    if (currentBrand) {
      loadCategories();
    }
  }, [currentBrand]);

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const loadCategories = async () => {
    try {
      const response = await axios.get(
        `${API}/giving-categories?brand_id=${currentBrand.id}`
      );
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const checkPaymentStatus = async () => {
    setCheckingPayment(true);
    let attempts = 0;
    const maxAttempts = 5;

    const poll = async () => {
      try {
        const response = await axios.get(`${API}/payments/status/${sessionId}`);
        
        if (response.data.payment_status === 'paid') {
          setPaymentComplete(true);
          toast.success('Payment successful! Thank you for your generosity.');
          setCheckingPayment(false);
          return;
        } else if (response.data.status === 'expired') {
          toast.error('Payment session expired');
          setCheckingPayment(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setCheckingPayment(false);
          toast.info('Payment is still processing. Please check your email.');
        }
      } catch (error) {
        console.error('Error checking payment:', error);
        setCheckingPayment(false);
      }
    };

    poll();
  };

  const handleGive = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!currentBrand) {
      toast.error('Please select a church');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/payments/create-checkout`,
        {
          amount: parseFloat(amount),
          category: selectedCategory,
          donor_name: donorName || 'Anonymous',
          brand_id: currentBrand.id
        },
        {
          headers: localStorage.getItem('memberToken')
            ? { Authorization: `Bearer ${localStorage.getItem('memberToken')}` }
            : {}
        }
      );

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error(error.response?.data?.detail || 'Failed to process payment');
      setLoading(false);
    }
  };

  if (checkingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Your generous gift has been received. You will receive a confirmation email shortly.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/giving')} className="w-full">
                Give Again
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Give With A Generous Heart
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your generosity makes a difference in our community and helps us fulfill our mission.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleGive} className="space-y-8">
              {/* Category Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Select Category
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {['Tithes & Offerings', 'Building Fund', 'Missions', 'Special Projects'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedCategory === cat
                            ? 'border-amber-600 bg-amber-50 text-amber-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium">{cat}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Quick Amount Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Quick Amount
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt.toString())}
                      className={`py-3 rounded-lg border-2 transition-all font-semibold ${
                        amount === amt.toString()
                          ? 'border-amber-600 bg-amber-50 text-amber-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Or Enter Custom Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Donor Name */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  placeholder="John Doe"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !amount}
                className="w-full py-6 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-6 w-6" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-6 w-6" />
                    Give ${amount || '0'}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>🔒 Secure payment processing by Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Giving;