import { useEffect, useMemo, useState } from 'react';
import {
  MdOutlineAdd,
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineSearch,
  MdOutlineFilterList,
  MdOutlinePlace,
  MdOutlineLandscape,
  MdOutlineStraighten,
  MdOutlineWater,
  MdOutlineAgriculture,
} from 'react-icons/md';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  Input,
  SkeletonCard,
} from '@/components/ui';
import { FarmForm } from '@/components/farm/FarmForm';
import { farmService } from '@/services/farm.service';
import type { Farm } from '@/types';
import type { FarmFormValues } from '@/utils/validation';

const FILTER_OPTIONS = ['all', 'loamy', 'clay', 'sandy', 'other'] as const;

type SoilFilter = (typeof FILTER_OPTIONS)[number];

function normalizeSoilType(value?: string | null): string {
  if (!value) return 'other';
  return value.toLowerCase();
}

export function FarmManagement() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [search, setSearch] = useState('');
  const [soilFilter, setSoilFilter] = useState<SoilFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadFarms = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await farmService.list();
      setFarms(result);
      setIsDemoData(farmService.isDemoMode());
    } catch {
      setLoadError('Could not load your farms right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFarms();
  }, []);

  const filteredFarms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return farms.filter((farm) => {
      const matchesSearch =
        !query ||
        farm.farm_name.toLowerCase().includes(query) ||
        farm.location.toLowerCase().includes(query) ||
        (farm.soil_type ?? '').toLowerCase().includes(query) ||
        (farm.water_source ?? '').toLowerCase().includes(query);

      const matchesFilter =
        soilFilter === 'all' ||
        (soilFilter === 'other' ? !farm.soil_type || !['loamy', 'clay', 'sandy'].includes(normalizeSoilType(farm.soil_type)) : normalizeSoilType(farm.soil_type) === soilFilter);

      return matchesSearch && matchesFilter;
    });
  }, [farms, search, soilFilter]);

  const openAddModal = () => {
    setEditingFarm(null);
    setIsModalOpen(true);
  };

  const openEditModal = (farm: Farm) => {
    setEditingFarm(farm);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: FarmFormValues) => {
    const payload = {
      farm_name: values.farm_name,
      location: values.location,
      soil_type: values.soil_type || undefined,
      farm_size: values.farm_size === '' ? undefined : Number(values.farm_size),
      water_source: values.water_source || undefined,
    };

    if (editingFarm) {
      const updated = await farmService.update(editingFarm.id, payload);
      setFarms((prev) => prev.map((farm) => (farm.id === updated.id ? updated : farm)));
    } else {
      const created = await farmService.create(payload);
      setFarms((prev) => [created, ...prev]);
    }

    setIsDemoData(farmService.isDemoMode());
    setIsModalOpen(false);
  };

  const handleDelete = async (farm: Farm) => {
    setDeletingId(farm.id);
    try {
      await farmService.remove(farm.id);
      setFarms((prev) => prev.filter((item) => item.id !== farm.id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container-app max-w-6xl py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Farm Management</h1>
          <p className="mt-2 text-foreground-muted">
            Track your fields, update details, and keep your farm records organized.
          </p>
        </div>
        <Button leftIcon={<MdOutlineAdd />} onClick={openAddModal}>
          Add farm
        </Button>
      </div>

      {isDemoData && (
        <Alert variant="info" className="mt-6">
          Showing locally saved demo farms — the live farm service was unavailable, so changes are stored in this browser only.
        </Alert>
      )}

      {loadError && (
        <Alert variant="error" className="mt-6" onClose={() => setLoadError(null)}>
          {loadError}
        </Alert>
      )}

      <Card className="mt-6">
        <CardHeader>
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Search and organize farms</h2>
            <p className="mt-0.5 text-sm text-foreground-muted">Filter by name, location, or soil type.</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                label="Search farms"
                placeholder="Search by name, location, or soil"
                leftIcon={<MdOutlineSearch />}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="md:w-56">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                Filter by soil
                <div className="relative flex items-center">
                  <MdOutlineFilterList className="pointer-events-none absolute left-3 h-4 w-4 text-foreground-muted" />
                  <select
                    value={soilFilter}
                    onChange={(event) => setSoilFilter(event.target.value as SoilFilter)}
                    className="h-11 w-full appearance-none rounded-xl border border-border bg-surface pl-9 pr-3.5 text-sm text-foreground transition-colors focus-ring"
                  >
                    <option value="all">All soils</option>
                    <option value="loamy">Loamy</option>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </label>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filteredFarms.length === 0 ? (
          <Card className="xl:col-span-2">
            <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
              <MdOutlineAgriculture className="h-8 w-8 text-foreground-muted" aria-hidden="true" />
              <p className="text-sm text-foreground-muted">
                No farms match the current search. Try another term or add a new farm.
              </p>
              <Button size="sm" leftIcon={<MdOutlineAdd />} onClick={openAddModal}>
                Add farm
              </Button>
            </CardBody>
          </Card>
        ) : (
          filteredFarms.map((farm) => (
            <Card key={farm.id} interactive>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{farm.farm_name}</h3>
                    <p className="mt-1 text-sm text-foreground-muted">{farm.location}</p>
                  </div>
                  <Dropdown
                    align="right"
                    trigger={
                      <button
                        type="button"
                        aria-label={`Actions for ${farm.farm_name}`}
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-muted focus-ring"
                      >
                        <MdOutlineDelete className="h-4.5 w-4.5" />
                      </button>
                    }
                    items={[
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: <MdOutlineEdit />,
                        onSelect: () => openEditModal(farm),
                      },
                      {
                        id: 'delete',
                        label: deletingId === farm.id ? 'Deleting…' : 'Delete',
                        icon: <MdOutlineDelete />,
                        destructive: true,
                        disabled: deletingId === farm.id,
                        onSelect: () => handleDelete(farm),
                      },
                    ]}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {farm.soil_type && <Badge variant="primary">{farm.soil_type}</Badge>}
                  {farm.farm_size != null && <Badge variant="secondary">{farm.farm_size} acres</Badge>}
                  {farm.water_source && <Badge variant="accent">{farm.water_source}</Badge>}
                </div>

                <div className="mt-4 space-y-2 text-sm text-foreground-muted">
                  <p className="flex items-center gap-2">
                    <MdOutlinePlace className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {farm.location}
                  </p>
                  {farm.soil_type && (
                    <p className="flex items-center gap-2">
                      <MdOutlineLandscape className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {farm.soil_type} soil
                    </p>
                  )}
                  {farm.farm_size != null && (
                    <p className="flex items-center gap-2">
                      <MdOutlineStraighten className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {farm.farm_size} acres
                    </p>
                  )}
                  {farm.water_source && (
                    <p className="flex items-center gap-2">
                      <MdOutlineWater className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {farm.water_source}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      <FarmForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} farm={editingFarm} onSubmit={handleSubmit} />
    </div>
  );
}
