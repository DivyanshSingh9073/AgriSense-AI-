import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MdOutlineAgriculture, MdOutlinePlace, MdOutlineWater, MdOutlineLandscape } from 'react-icons/md';
import { Button, Input, Modal, ModalBody, ModalFooter } from '@/components/ui';
import { farmSchema, type FarmFormValues } from '@/utils/validation';
import type { Farm } from '@/types';

interface FarmFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Present when editing an existing farm; absent when adding a new one. */
  farm?: Farm | null;
  onSubmit: (values: FarmFormValues) => Promise<void> | void;
}

const emptyValues: FarmFormValues = {
  farm_name: '',
  location: '',
  soil_type: '',
  farm_size: '',
  water_source: '',
};

/** Add/edit form for a single farm, reused by the Profile page's farm list. */
export function FarmFormModal({ isOpen, onClose, farm, onSubmit }: FarmFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      farm
        ? {
            farm_name: farm.farm_name,
            location: farm.location,
            soil_type: farm.soil_type ?? '',
            farm_size: farm.farm_size ?? '',
            water_source: farm.water_source ?? '',
          }
        : emptyValues,
    );
  }, [isOpen, farm, reset]);

  const handleFormSubmit = async (values: FarmFormValues) => {
    await onSubmit(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={farm ? 'Edit farm' : 'Add a farm'} size="md">
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Farm name"
              placeholder="North Field"
              leftIcon={<MdOutlineAgriculture />}
              error={errors.farm_name?.message}
              {...register('farm_name')}
            />
            <Input
              label="Location"
              placeholder="City, State"
              leftIcon={<MdOutlinePlace />}
              error={errors.location?.message}
              {...register('location')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Soil type"
                placeholder="Loamy"
                leftIcon={<MdOutlineLandscape />}
                error={errors.soil_type?.message}
                {...register('soil_type')}
              />
              <Input
                label="Farm size (acres)"
                type="number"
                step="0.1"
                placeholder="4.5"
                error={errors.farm_size?.message as string | undefined}
                {...register('farm_size')}
              />
            </div>
            <Input
              label="Water source"
              placeholder="Canal irrigation"
              leftIcon={<MdOutlineWater />}
              error={errors.water_source?.message}
              {...register('water_source')}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {farm ? 'Save changes' : 'Add farm'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
