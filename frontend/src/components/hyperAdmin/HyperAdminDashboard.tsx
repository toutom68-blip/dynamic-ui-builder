import { useEffect, useState } from 'react';
import { hyperAdminAPI } from '../../lib/api';
import { Building2, Users, Briefcase, Camera, FileText, UserCircle, Loader2 } from 'lucide-react';

interface OrgRow {
  organization: { id: string; name: string; slug: string; isActive: boolean };
  admins: number;
  coordinators: number;
  missions: number;
  visits: number;
  reports: number;
  clients: number;
}

interface Dashboard {
  totals: {
    organizations: number;
    users: number;
    missions: number;
    visits: number;
    reports: number;
    clients: number;
  };
  perOrganization: OrgRow[];
}

const Stat = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

export default function HyperAdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    hyperAdminAPI
      .dashboard()
      .then(setData)
      .catch((e) => setError(e.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Vue globale</h1>
        <p className="text-slate-500 mt-1">Métriques agrégées sur toutes les organisations.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Stat icon={Building2} label="Organisations" value={data.totals.organizations} color="bg-amber-500" />
        <Stat icon={Users} label="Utilisateurs" value={data.totals.users} color="bg-blue-500" />
        <Stat icon={Briefcase} label="Chantiers" value={data.totals.missions} color="bg-emerald-500" />
        <Stat icon={Camera} label="Visites" value={data.totals.visits} color="bg-violet-500" />
        <Stat icon={FileText} label="Rapports" value={data.totals.reports} color="bg-rose-500" />
        <Stat icon={UserCircle} label="Clients" value={data.totals.clients} color="bg-slate-700" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Détails par organisation</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Organisation</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-right">Admins</th>
                <th className="px-4 py-3 text-right">Coordinateurs</th>
                <th className="px-4 py-3 text-right">Chantiers</th>
                <th className="px-4 py-3 text-right">Visites</th>
                <th className="px-4 py-3 text-right">Rapports</th>
                <th className="px-4 py-3 text-right">Clients</th>
                <th className="px-4 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.perOrganization.map((row) => (
                <tr key={row.organization.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">{row.organization.name}</td>
                  <td className="px-4 py-3 text-slate-500">/login/{row.organization.slug}</td>
                  <td className="px-4 py-3 text-right">{row.admins}</td>
                  <td className="px-4 py-3 text-right">{row.coordinators}</td>
                  <td className="px-4 py-3 text-right">{row.missions}</td>
                  <td className="px-4 py-3 text-right">{row.visits}</td>
                  <td className="px-4 py-3 text-right">{row.reports}</td>
                  <td className="px-4 py-3 text-right">{row.clients}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${row.organization.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {row.organization.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
              {data.perOrganization.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-slate-400">Aucune organisation</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
