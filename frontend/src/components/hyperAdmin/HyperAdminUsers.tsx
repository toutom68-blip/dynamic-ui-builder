import { useEffect, useMemo, useState } from 'react';
import { hyperAdminAPI, organizationsAPI } from '../../lib/api';
import { Plus, Pencil, Trash2, X, Loader2, Users, Shield, UserCog, KeyRound } from 'lucide-react';
import PermissionsModal, { UserPermissions } from './PermissionsModal';

type Role = 'ROLE_ADMIN' | 'ROLE_USER' | 'ROLE_HYPER_ADMIN';

interface OrgItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
  company?: string;
  isActive: boolean;
  organizationId: string | null;
  permissions?: UserPermissions | null;
  createdAt: string;
}

const emptyForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  role: 'ROLE_USER' as Role,
  isActive: true,
};

export default function HyperAdminUsers() {
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [permsTarget, setPermsTarget] = useState<UserItem | null>(null);

  const loadOrgs = async () => {
    setLoadingOrgs(true);
    try {
      const data = await organizationsAPI.getAll();
      setOrgs(data);
      if (data.length && !selectedOrgId) setSelectedOrgId(data[0].id);
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setLoadingOrgs(false);
    }
  };

  const loadUsers = async (orgId: string) => {
    if (!orgId) return;
    setLoadingUsers(true);
    try {
      const data = await hyperAdminAPI.orgUsers(orgId);
      setUsers(data);
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { loadOrgs(); }, []);
  useEffect(() => { if (selectedOrgId) loadUsers(selectedOrgId); }, [selectedOrgId]);

  const selectedOrg = useMemo(
    () => orgs.find((o) => o.id === selectedOrgId) || null,
    [orgs, selectedOrgId],
  );

  const filtered = useMemo(
    () => users.filter((u) => roleFilter === 'all' || u.role === roleFilter),
    [users, roleFilter],
  );

  const counts = useMemo(() => ({
    admins: users.filter((u) => u.role === 'ROLE_ADMIN').length,
    coords: users.filter((u) => u.role === 'ROLE_USER').length,
  }), [users]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (u: UserItem) => {
    setEditing(u);
    setForm({
      email: u.email,
      password: '',
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone || '',
      company: u.company || '',
      role: u.role === 'ROLE_HYPER_ADMIN' ? 'ROLE_ADMIN' : u.role,
      isActive: u.isActive,
    });
    setShowModal(true);
  };

  const close = () => { setShowModal(false); setEditing(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) return;
    setSaving(true);
    try {
      if (editing) {
        const payload: any = {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
          company: form.company || undefined,
          role: form.role,
          isActive: form.isActive,
        };
        if (form.password) payload.password = form.password;
        await hyperAdminAPI.updateUser(editing.id, payload);
      } else {
        await hyperAdminAPI.createOrgUser(selectedOrgId, {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
          company: form.company || undefined,
          role: form.role,
          isActive: form.isActive,
        });
      }
      close();
      await loadUsers(selectedOrgId);
    } catch (e: any) {
      alert(e.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u: UserItem) => {
    if (!confirm(`Supprimer ${u.firstName} ${u.lastName} (${u.email}) ?`)) return;
    try {
      await hyperAdminAPI.deleteUser(u.id);
      await loadUsers(selectedOrgId);
    } catch (e: any) {
      alert(e.message || 'Erreur');
    }
  };

  const toggleActive = async (u: UserItem) => {
    try {
      await hyperAdminAPI.updateUser(u.id, { isActive: !u.isActive });
      await loadUsers(selectedOrgId);
    } catch (e: any) {
      alert(e.message || 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admins & coordinateurs</h1>
          <p className="text-slate-500 mt-1">Gérez les utilisateurs de chaque organisation.</p>
        </div>
        <button
          onClick={openCreate}
          disabled={!selectedOrgId}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Nouvel utilisateur
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Organisation</label>
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            disabled={loadingOrgs}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
          >
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>{o.name} — /{o.slug}{o.isActive ? '' : ' (inactif)'}</option>
            ))}
            {orgs.length === 0 && <option value="">Aucune organisation</option>}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Filtrer</label>
          <div className="inline-flex bg-slate-100 rounded-lg p-1">
            {(['all', 'ROLE_ADMIN', 'ROLE_USER'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${roleFilter === r ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
              >
                {r === 'all' ? 'Tous' : r === 'ROLE_ADMIN' ? 'Admins' : 'Coordinateurs'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <Stat icon={<Shield className="w-3.5 h-3.5" />} label="Admins" value={counts.admins} />
          <Stat icon={<UserCog className="w-3.5 h-3.5" />} label="Coordinateurs" value={counts.coords} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loadingUsers ? (
          <div className="p-6 flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
            Aucun utilisateur {selectedOrg ? `pour ${selectedOrg.name}` : ''}.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Rôle</th>
                <th className="text-left px-4 py-3">Société</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'ROLE_ADMIN' ? 'bg-blue-100 text-blue-700' : u.role === 'ROLE_HYPER_ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                      {u.role === 'ROLE_ADMIN' ? 'Admin' : u.role === 'ROLE_HYPER_ADMIN' ? 'Hyper Admin' : 'Coordinateur'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.company || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                    >
                      {u.isActive ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'ROLE_HYPER_ADMIN' && (
                      <button
                        onClick={() => setPermsTarget(u)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 rounded"
                      >
                        <KeyRound className="w-3 h-3" /> Permissions
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(u)}
                      className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                    >
                      <Pencil className="w-3 h-3" /> Modifier
                    </button>
                    {u.role !== 'ROLE_HYPER_ADMIN' && (
                      <button
                        onClick={() => remove(u)}
                        className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editing ? `Modifier ${editing.firstName} ${editing.lastName}` : `Nouvel utilisateur — ${selectedOrg?.name || ''}`}
              </h2>
              <button onClick={close} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prénom *" required value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
                <Field label="Nom *" required value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
              </div>
              <Field label="Email *" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field
                label={editing ? 'Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
                type="password"
                required={!editing}
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
                hint="6-16 car., 1 maj, 1 min, 1 chiffre. Spéciaux autorisés: ! _ - ."
              />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="Société" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rôle *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ROLE_ADMIN">Admin (gère son organisation)</option>
                  <option value="ROLE_USER">Coordinateur (terrain)</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <span className="text-sm">Compte actif</span>
              </label>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button type="button" onClick={close} className="px-4 py-2 text-sm rounded-lg hover:bg-slate-100">Annuler</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {permsTarget && (
        <PermissionsModal
          user={permsTarget}
          onClose={() => setPermsTarget(null)}
          onSaved={async () => {
            try {
              const data = await hyperAdminAPI.orgUsers(selectedOrgId);
              setUsers(data);
              const fresh = data.find((u: any) => u.id === permsTarget.id);
              if (fresh) setPermsTarget(fresh);
            } catch (e: any) {
              setError(e.message || 'Erreur');
            }
          }}
        />
      )}
    </div>
  );
}

const Field = ({ label, value, onChange, type = 'text', required, hint }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
    />
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const Stat = ({ icon, label, value }: any) => (
  <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
    {icon}
    <span className="text-slate-500">{label}:</span>
    <span className="font-semibold text-slate-900">{value}</span>
  </div>
);
