import { ref } from 'vue';
import { getTypoDistance, normalizeForComparison } from '@/utils/string';

export function useRoomFacilities(selectedFacilityIds) {
    const facilityOptions = ref([
        { id: 1, label: 'Private Bathroom' },
        { id: 2, label: 'Private Kitchen' },
        { id: 3, label: 'AC' },
        { id: 4, label: 'WiFi' },
        { id: 5, label: 'Bed' },
    ]);

    const handleCreateNewFacility = (newFacilityName) => {
        if (!newFacilityName || typeof newFacilityName !== 'string' || !newFacilityName.trim()) {
            return { status: 'error', message: 'Invalid facility name.' };
        }

        const normalizedInput = normalizeForComparison(newFacilityName);

        const matchedFacility = facilityOptions.value.find(existingFacility => {
            const normalizedExisting = normalizeForComparison(existingFacility.label);

            if (normalizedExisting === normalizedInput) return true;

            if (normalizedInput.length > 2 && normalizedExisting.length > 2) {
                return getTypoDistance(normalizedInput, normalizedExisting) <= 1;
            }
            return false;
        });

        if (matchedFacility) {
            if (!selectedFacilityIds.includes(matchedFacility.id)) {
                selectedFacilityIds.push(matchedFacility.id);
                return {
                    status: 'info',
                    message: `Similar facility "${matchedFacility.label}" found and automatically added.`
                };
            }
            return {
                status: 'warning',
                message: `Facility "${matchedFacility.label}" is already selected!`
            };
        }

        const newId = facilityOptions.value.length > 0
            ? Math.max(...facilityOptions.value.map(option => option.id)) + 1
            : 1;

        facilityOptions.value.push({ id: newId, label: newFacilityName.trim() });
        selectedFacilityIds.push(newId);

        return { status: 'success', message: 'New facility added successfully.' };
    };

    return {
        facilityOptions,
        handleCreateNewFacility
    };
}