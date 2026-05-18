import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { publicOrgAPI } from '../lib/api';
import { Lock, Mail, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

interface OrgBranding {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  loginTitle?: string | null;
  loginContent?: string | null;
}

export default function OrgLoginPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  const [org, setOrg] = useState<OrgBranding | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgError, setOrgError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let mounted = true;
    publicOrgAPI
      .getBySlug(slug)
      .then((data) => {
        if (mounted) setOrg(data);
      })
      .catch(() => {
        if (mounted) setOrgError('Organisation introuvable');
      })
      .finally(() => mounted && setOrgLoading(false));
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ROLE_HYPER_ADMIN' ? '/hyper-admin' : '/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password, slug);
    if (error) {
      setError(error.message || 'Identifiants incorrects.');
      setLoading(false);
    }
  };

  if (orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (orgError || !org) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-xl font-bold text-slate-900">Organisation introuvable</h1>
        <p className="text-slate-600">L'URL <code>/login/{slug}</code> ne correspond à aucune organisation active.</p>
        <button onClick={() => navigate('/login')} className="mt-2 text-blue-600 hover:underline">
          Aller au portail principal
        </button>
      </div>
    );
  }

  const primary = org.primaryColor || '#1e40af';
  const secondary = org.secondaryColor || '#0f172a';

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)` }}
    >
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              {org.logoUrl ? (
                <img src={org.logoUrl} alt={org.name} className="h-24 object-contain" />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                  style={{ backgroundColor: primary }}
                >
                  {org.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{org.name}</h1>
            <p className="text-slate-600 text-sm">{org.loginTitle || 'Portail de connexion'}</p>
            {org.loginContent && (
              <p className="text-slate-500 text-sm mt-3 whitespace-pre-line">{org.loginContent}</p>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2"
                  style={{ ['--tw-ring-color' as any]: primary }}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-medium transition-opacity disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-white/90 mt-6">Système sécurisé conforme RGPD</p>
      </div>
    </div>
  );
}
