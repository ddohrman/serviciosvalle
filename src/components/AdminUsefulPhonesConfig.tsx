import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  AlertCircle, 
  Search, 
  RotateCcw,
  Shield,
  Flame,
  Zap,
  Droplets,
  HeartPulse,
  Truck
} from 'lucide-react';
import { UsefulPhone } from '../types';
import { EMERGENCY_NUMBERS } from '../data/mockData';

interface AdminUsefulPhonesConfigProps {
  usefulPhones: UsefulPhone[];
  onSaveUsefulPhones: (updatedList: UsefulPhone[]) => void;
}

const PHONE_ICONS = [
  { id: 'hospital', label: 'Hospital / Salud', icon: HeartPulse },
  { id: 'shield', label: 'Policía / 911', icon: Shield },
  { id: 'fire_extinguisher', label: 'Bomberos', icon: Flame },
  { id: 'flame', label: 'Gas / Gasnor', icon: Flame },
  { id: 'zap', label: 'Luz / EDESA', icon: Zap },
  { id: 'water', label: 'Agua / Cloacas', icon: Droplets },
  { id: 'building', label: 'Municipalidad', icon: Building2 },
  { id: 'transport', label: 'Tránsito / Grúa', icon: Truck },
];

export const AdminUsefulPhonesConfig: React.FC<AdminUsefulPhonesConfigProps> = ({
  usefulPhones,
  onSaveUsefulPhones
}) => {
  const [phones, setPhones] = useState<UsefulPhone[]>(() => {
    return usefulPhones && usefulPhones.length > 0 ? usefulPhones : EMERGENCY_NUMBERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // New Phone Form
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIcon, setNewIcon] = useState('hospital');
  const [newNeighborhood, setNewNeighborhood] = useState('Cerrillos');
  const [newDescription, setNewDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit Phone Form
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIcon, setEditIcon] = useState('hospital');
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const saveAndNotify = (newList: UsefulPhone[]) => {
    setPhones(newList);
    onSaveUsefulPhones(newList);
    try {
      localStorage.setItem('oficios_useful_phones', JSON.stringify(newList));
    } catch {
      // ignore
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setNewName('');
    setNewPhone('');
    setNewIcon('hospital');
    setNewNeighborhood('Cerrillos');
    setNewDescription('');
    setErrorMsg(null);
  };

  const handleConfirmAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      setErrorMsg('Ingresá el nombre de la institución y el número de teléfono.');
      return;
    }

    const newItem: UsefulPhone = {
      id: `phone-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      icon: newIcon,
      neighborhood: newNeighborhood.trim() || undefined,
      description: newDescription.trim() || undefined
    };

    const updated = [...phones, newItem];
    saveAndNotify(updated);
    setIsAdding(false);
    setErrorMsg(null);
  };

  const handleStartEdit = (index: number) => {
    const item = phones[index];
    if (!item) return;
    setEditingIndex(index);
    setIsAdding(false);
    setEditName(item.name);
    setEditPhone(item.phone);
    setEditIcon(item.icon || 'hospital');
    setEditNeighborhood(item.neighborhood || '');
    setEditDescription(item.description || '');
  };

  const handleConfirmEdit = (index: number) => {
    if (!editName.trim() || !editPhone.trim()) return;

    const updated = [...phones];
    updated[index] = {
      ...updated[index],
      name: editName.trim(),
      phone: editPhone.trim(),
      icon: editIcon,
      neighborhood: editNeighborhood.trim() || undefined,
      description: editDescription.trim() || undefined
    };

    saveAndNotify(updated);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${phones[index]?.name}" de los teléfonos útiles?`)) {
      const updated = phones.filter((_, i) => i !== index);
      saveAndNotify(updated);
      if (editingIndex === index) setEditingIndex(null);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('¿Deseas restablecer los teléfonos útiles originales del Valle de Lerma?')) {
      saveAndNotify(EMERGENCY_NUMBERS);
      setEditingIndex(null);
      setIsAdding(false);
    }
  };

  const filteredPhones = phones.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.neighborhood && p.neighborhood.toLowerCase().includes(q))
    );
  });

  const renderIconBadge = (iconName?: string) => {
    switch (iconName) {
      case 'shield':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'fire_extinguisher':
      case 'flame':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'building':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'transport':
        return <Truck className="w-4 h-4 text-purple-600" />;
      case 'hospital':
      default:
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#9e4300] flex items-center justify-center font-bold shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-[#001428]">
                Teléfonos Útiles y de Emergencia
              </h3>
              <span className="text-[10px] bg-orange-100 text-[#9e4300] font-black px-2 py-0.5 rounded-full">
                {phones.length} números
              </span>
            </div>
            <p className="text-xs text-[#74777e]">
              Administrá los teléfonos de guardia, hospitales, policía y servicios que se muestran en el perfil de los vecinos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleStartAdd}
            className="px-3.5 py-2 bg-[#9e4300] hover:bg-[#853900] active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Teléfono</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            title="Restablecer lista predeterminada"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Predeterminados</span>
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar teléfono por nombre de hospital, policía, guardia o localidad..."
          className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
        />
      </div>

      {/* Formulario de Agregar Nuevo Teléfono */}
      {isAdding && (
        <form onSubmit={handleConfirmAdd} className="p-4 bg-orange-50/70 rounded-2xl border-2 border-orange-200 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-[#9e4300] tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Nuevo Teléfono Útil para el Valle de Lerma</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-2 bg-red-100 border border-red-300 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-800 block mb-1">
                Nombre de la institución o servicio *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Hospital Santa Teresita (Cerrillos)"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-800 block mb-1">
                Número de teléfono directo *
              </label>
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Ej: 0387 499-9022 o 911"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-800 block mb-1">
                Tipo / Icono
              </label>
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
              >
                {PHONE_ICONS.map(i => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-800 block mb-1">
                Localidad de cobertura
              </label>
              <input
                type="text"
                value={newNeighborhood}
                onChange={(e) => setNewNeighborhood(e.target.value)}
                placeholder="Ej: Cerrillos, La Merced, Todo el Valle"
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 bg-white text-gray-700 text-xs font-bold rounded-xl border border-gray-300 hover:bg-gray-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Guardar Teléfono
            </button>
          </div>
        </form>
      )}

      {/* Lista de Teléfonos Útiles */}
      <div className="space-y-2">
        {filteredPhones.map((item, idx) => {
          const isEditing = editingIndex === idx;

          if (isEditing) {
            return (
              <div key={idx} className="p-3.5 bg-orange-50/90 rounded-xl border-2 border-orange-300 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9e4300]">Modificar Teléfono Útil</span>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nombre"
                    className="text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Teléfono"
                    className="text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  >
                    {PHONE_ICONS.map(i => (
                      <option key={i.id} value={i.id}>{i.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editNeighborhood}
                    onChange={(e) => setEditNeighborhood(e.target.value)}
                    placeholder="Localidad (Opcional)"
                    className="text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 bg-white hover:bg-gray-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmEdit(idx)}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="p-3 rounded-xl border border-gray-200 hover:border-orange-300 bg-white hover:bg-orange-50/10 flex items-center justify-between gap-3 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                  {renderIconBadge(item.icon)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-[#001428] truncate">
                      {item.name}
                    </p>
                    {item.neighborhood && (
                      <span className="text-[10px] bg-gray-100 text-gray-700 font-semibold px-2 py-0.2 rounded-full border border-gray-200 shrink-0">
                        {item.neighborhood}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#9e4300] font-mono mt-0.5">
                    {item.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                  title="Probar llamada"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleStartEdit(idx)}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                  title="Modificar teléfono"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                  title="Eliminar teléfono"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredPhones.length === 0 && (
          <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-xs">
            No se encontraron teléfonos útiles con el término buscado.
          </div>
        )}
      </div>
    </div>
  );
};
