import { useState, useEffect } from 'react';

function XSS() {
  const [username, setUsername] = useState('Korisnik');
  const [comment, setComment] = useState('');
  const [xssProtectionEnabled, setXssProtectionEnabled] = useState(true);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    if (!xssProtectionEnabled) {
      setTimeout(() => {
        const commentElements = document.querySelectorAll('.comment-body');
        commentElements.forEach(element => {
          const scripts = element.querySelectorAll('script');
          scripts.forEach(script => {
            try {
              const func = new Function(script.textContent);
              func();
            } catch (e) {
              console.error('Script execution error:', e);
            }
          });
        });
      }, 100);
    }
  }, [comments, xssProtectionEnabled]);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments');
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      setMessage({
        success: false,
        message: 'Greška pri dohvaćanju komentara',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          comment,
          xssProtectionEnabled,
        }),
      });

      const data = await response.json();
      setMessage(data);

      if (data.success) {
        setComment('');
        fetchComments();
      }
    } catch (error) {
      setMessage({
        success: false,
        message: 'Greška pri slanju komentara',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearComments = async () => {
    if (window.confirm('Jeste li sigurni da želite obrisati sve komentare?')) {
      try {
        const response = await fetch('/api/comments', {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          fetchComments();
          setMessage({ success: true, message: 'Svi komentari obrisani!' });
        }
      } catch (error) {
        setMessage({
          success: false,
          message: 'Greška pri brisanju komentara',
        });
      }
    }
  };

  const sanitizeComment = (html) => {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  };

  const getDisplayComment = (comment) => {
    if (xssProtectionEnabled) {
      return sanitizeComment(comment);
    }
    return comment;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-300 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Cross-Site Scripting (XSS) - Stored XSS
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Demonstracija prikazuje primjer pohranjenog XSS napada koji omogućava napadaču ubacivanje zlonamjernog JavaScript koda kroz komentar.
          Kada je ranjivost uključena, skripte se izvršavaju u pregledniku svake osobe koja posjeti stranicu.
          Kada je zaštita uključena, sadržaj komentara se sanitizira prije pohrane u bazu.
        </p>
        <div className="text-sm text-gray-600">
          <strong>Primjeri za testiranje:</strong>
          <div className="mt-1 space-y-1 font-mono text-xs">
            <div>&lt;script&gt;alert('XSS napad!')&lt;/script&gt;</div>
            <div>&lt;img src=x onerror="alert('XSS putem slike')"&gt;</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 p-6">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={xssProtectionEnabled}
              onChange={(e) => setXssProtectionEnabled(e.target.checked)}
              className="sr-only"
            />
            <div className={`block w-14 h-8 rounded-full transition ${!xssProtectionEnabled ? 'bg-gray-800' : 'bg-gray-400'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${!xssProtectionEnabled ? 'translate-x-6' : ''}`}></div>
          </div>
          <div className="ml-4">
            <span className="text-base font-medium text-gray-900">
              Ranjivosti {!xssProtectionEnabled ? 'uključene (XSS moguć)' : 'isključene (sigurno)'}
            </span>
          </div>
        </label>
      </div>

      <div className="bg-white border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dodaj komentar
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Korisničko ime
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
              placeholder="Vaše ime"
              required
            />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Komentar
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500 resize-none"
              placeholder="Unesite komentar..."
              rows="4"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 transition"
            >
              {loading ? 'Šaljem...' : 'Dodaj komentar'}
            </button>
            <button
              type="button"
              onClick={handleClearComments}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 transition"
            >
              Obriši sve komentare
            </button>
          </div>
        </form>

        {message && (
          <div className={`mt-4 p-4 border ${message.success ? 'bg-white border-gray-500' : 'bg-gray-50 border-gray-600'}`}>
            <p className="font-medium text-gray-900">
              {message.message}
            </p>
            {message.protected !== undefined && (
              <p className="text-sm mt-1 text-gray-700">
                <strong>Zaštita:</strong> {message.protected ? 'Uključena' : 'Isključena'}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Komentari ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm font-medium">Nema komentara.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-50 p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {c.username.charAt(0).toUpperCase()}
                    </div>
                    <strong className="text-gray-900">{c.username}</strong>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleString('hr-HR')}
                  </span>
                </div>
                <div
                  className="text-gray-800 pl-10 comment-body"
                  dangerouslySetInnerHTML={{ __html: getDisplayComment(c.comment) }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default XSS;
