import { useState, useEffect } from 'react';

function SensitiveDataExposure() {
  const [exposureEnabled, setExposureEnabled] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    creditCard: ''
  });
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sensitive-data?exposureEnabled=${exposureEnabled}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      setData({
        success: false,
        message: 'Greška pri dohvaćanju podataka',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = () => {
    setExposureEnabled(!exposureEnabled);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/sensitive-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          encryptionEnabled: !exposureEnabled
        }),
      });

      const result = await response.json();
      setMessage(result);

      if (result.success) {
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          password: '',
          creditCard: ''
        });
        fetchData();
      }
    } catch (error) {
      setMessage({
        success: false,
        message: 'Greška pri spremanju podataka',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-gray-300 p-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Sensitive Data Exposure
        </h2>
      </div>

      {/* Vulnerability Toggle */}
      <div className="bg-white border border-gray-300 p-6">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={exposureEnabled}
              onChange={handleToggle}
              className="sr-only"
            />
            <div className={`block w-14 h-8 rounded-full transition ${exposureEnabled ? 'bg-gray-800' : 'bg-gray-400'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${exposureEnabled ? 'translate-x-6' : ''}`}></div>
          </div>
          <div className="ml-4">
            <span className="text-base font-medium text-gray-900">
              Ranjivost {exposureEnabled ? 'uključena (NESIGURNO)' : 'isključena (sigurno)'}
            </span>
          </div>
        </label>

        {exposureEnabled && (
          <div className="mt-4 bg-gray-100 border border-gray-400 p-3">
            <div>
              <strong className="text-gray-900">UPOZORENJE:</strong>
              <span className="text-gray-700"> Osjetljivi podaci se prikazuju u plain textu!</span>
            </div>
          </div>
        )}
      </div>

      {/* Data Entry Form */}
      <div className="bg-white border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Unos osjetljivih podataka
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Ime
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                placeholder="Unesite ime"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Prezime
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                placeholder="Unesite prezime"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Korisničko ime
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
              placeholder="Unesite korisničko ime"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Lozinka
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
              placeholder="Unesite lozinku"
              required
            />
          </div>

          <div>
            <label htmlFor="creditCard" className="block text-sm font-medium text-gray-700 mb-1">
              Broj kreditne kartice
            </label>
            <input
              type="text"
              id="creditCard"
              name="creditCard"
              value={formData.creditCard}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium py-2 px-6 transition"
          >
            {loading ? 'Spremam...' : 'Spremi podatke'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-4 border ${message.success ? 'bg-white border-gray-500' : 'bg-gray-50 border-gray-600'}`}>
            <p className="font-medium text-gray-900">
              {message.message}
            </p>
          </div>
        )}
      </div>

      {/* Fetch Button */}
      <div className="bg-white border border-gray-300 p-6">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium py-3 px-6 transition duration-200"
        >
          {loading ? (
            'Učitavam...'
          ) : (
            'Prikaži podatke iz baze'
          )}
        </button>
      </div>

      {/* Data Display */}
      {data && data.success && (
        <div className="bg-white border border-gray-300 p-6">
          <div className="mb-4 p-4 border border-gray-300 bg-gray-50">
            <p className="font-medium text-gray-900">
              Status: {data.message}
            </p>
          </div>

          {data.data && data.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">Status pohrane</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">Ime</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">Prezime</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">Korisničko ime</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">Lozinka</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">Kreditna kartica</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((item, index) => (
                    <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold ${item.is_encrypted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.is_encrypted ? 'SIGURNO (šifrirano)' : 'NESIGURNO (plain text)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.first_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.last_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.username}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.password}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.credit_card}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SensitiveDataExposure;
