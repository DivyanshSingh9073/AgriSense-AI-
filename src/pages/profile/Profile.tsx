import { useEffect, useState } from 'react';
import {
  MdOutlineAdd,
  MdOutlineMoreVert,
  MdOutlineEdit,
  MdOutlineDelete,
  MdOutlinePlace,
  MdOutlineWater,
  MdOutlineLandscape,
  MdOutlineStraighten,
  MdVerified,
} from 'react-icons/md';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  Dropdown,
  SkeletonCard,
} from '@/components/ui';
import { useAuth } from '@/hooks';
import { farmService } from '@/services/farm.service';
import type { Farm } from '@/types';
import type { FarmFormValues } from '@/utils/validation';
import { FarmFormModal } from './FarmFormModal';

/** User's personal profile and farm details. */
export function Profile() {
  const { user } = useAuth();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoData, setIsDemoData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
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
    loadFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingFarm(null);
    setModalOpen(true);
  };

  const openEditModal = (farm: Farm) => {
    setEditingFarm(farm);
    setModalOpen(true);
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
      setFarms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } else {
      const created = await farmService.create(payload);
      setFarms((prev) => [created, ...prev]);
    }
    setIsDemoData(farmService.isDemoMode());
    setModalOpen(false);
  };

  const handleDelete = async (farm: Farm) => {
    setDeletingId(farm.id);
    try {
      await farmService.remove(farm.id);
      setFarms((prev) => prev.filter((f) => f.id !== farm.id));
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="container-app max-w-4xl py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Profile</h1>
        <p className="mt-2 text-foreground-muted">Manage your personal and farm details.</p>
      </div>

      {/* Account overview */}
      <Card className="mt-6">
        <CardBody className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar name={user.name} src={user.avatarUrl ?? undefined} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-semibold text-foreground">{user.name}</h2>
              <Badge variant={user.role === 'admin' ? 'accent' : 'primary'}>{user.role}</Badge>
              {user.isEmailVerified && (
                <Badge variant="success" dot>
                  Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-foreground-muted">{user.email}</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Member since{' '}
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          {user.isEmailVerified && (
            <MdVerified className="hidden h-6 w-6 shrink-0 text-success sm:block" aria-hidden="true" />
          )}
        </CardBody>
      </Card>

      {/* Farms */}
      <div className="mt-8 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Your farms</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            The fields AgriSense uses for weather, crop, and disease insights.
          </p>
        </div>
        <Button size="sm" leftIcon={<MdOutlineAdd />} onClick={openAddModal}>
          Add farm
        </Button>
      </div>

      {isDemoData && (
        <Alert variant="info" className="mt-4">
          Showing locally saved demo farms — the live farm service wasn't reachable, so changes here are
          stored in this browser only.
        </Alert>
      )}

      {loadError && (
        <Alert variant="error" className="mt-4" onClose={() => setLoadError(null)}>
          {loadError}
        </Alert>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : farms.length === 0 ? (
          <Card className="sm:col-span-2">
            <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-foreground-muted">
                You haven't added any farms yet. Add one to get tailored weather and crop insights.
              </p>
              <Button size="sm" leftIcon={<MdOutlineAdd />} onClick={openAddModal}>
                Add your first farm
              </Button>
            </CardBody>
          </Card>
        ) : (
          farms.map((farm) => (
            <Card key={farm.id} interactive>
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {farm.farm_name}
                  </h3>
                  <Dropdown
                    align="right"
                    trigger={
                      <button
                        type="button"
                        aria-label={`Actions for ${farm.farm_name}`}
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-muted focus-ring"
                      >
                        <MdOutlineMoreVert className="h-4.5 w-4.5" />
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

                <div className="mt-3 space-y-1.5 text-sm text-foreground-muted">
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

      <FarmFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        farm={editingFarm}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
