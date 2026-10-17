import { ref } from 'vue';

export function useRoomFacilities() {
    const facilityOptions = ref([
        { id: 1, name: 'Private Bathroom' },
        { id: 2, name: 'Private Kitchen' },
        { id: 3, name: 'AC' },
        { id: 4, name: 'WiFi' },
        { id: 5, name: 'Bed' },
        { id: 6, name: 'Desk' },
        { id: 7, name: 'Fan' },
        { id: 8, name: 'TV' },
    ]);

    return {
        facilityOptions,
    };
}