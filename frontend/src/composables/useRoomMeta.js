import { ref, computed } from 'vue';
import apiClient from '@/services/api';
import { useRoom } from '@/composables/useRoom';

const metaData = ref({
    prices: [],
    floors: [],
    roomTypes: [],
    facilities: [],
    utilities: [],
    statuses: [
        { label: 'Available', value: 'available' },
        { label: 'Occupied', value: 'occupied' }
    ]
});

const isMetaFetching = ref(false);
const metaError = ref(null);
const hasFetchedMeta = ref(false);

export function useRoomMeta() {
    const { formatRupiah } = useRoom();

    const fetchRoomMeta = async (forceRefresh = false) => {
        if (isMetaFetching.value || (hasFetchedMeta.value && !forceRefresh)) return;

        isMetaFetching.value = true;
        metaError.value = null;

        try {
            const response = await apiClient.get('/rooms/meta');
            const data = response.data?.data;
            console.log(data)

            if (!data) throw new Error('Invalid metadata format from server');

            if (data.prices) {
                metaData.value.prices = data.prices.map(priceObj => ({
                    label: `${formatRupiah(priceObj.min_price)} – ${formatRupiah(priceObj.max_price)}`,
                    value: priceObj.id,
                    raw: priceObj
                }));
            }

            if (data.floors) {
                metaData.value.floors = data.floors.map(floorObj => ({
                    label: floorObj.name,
                    value: floorObj.id.toString()
                }));
            }

            if (data.room_types) {
                metaData.value.roomTypes = data.room_types.map(rt => ({
                    label: `${rt.name} Room`,
                    value: rt.id.toString()
                }));
            }

            if (data.facilities) metaData.value.facilities = data.facilities;
            if (data.utilities) metaData.value.utilities = data.utilities;

            hasFetchedMeta.value = true;
        } catch (err) {
            console.error('Failed to fetch room metadata:', err);
            metaError.value = err?.response?.data?.message || 'Failed to load filter options.';
            hasFetchedMeta.value = false;
        } finally {
            isMetaFetching.value = false;
        }
    };

    return {
        roomTypes: computed(() => metaData.value.roomTypes),
        floors: computed(() => metaData.value.floors),
        priceRanges: computed(() => metaData.value.prices),
        facilities: computed(() => metaData.value.facilities),
        utilities: computed(() => metaData.value.utilities),
        statuses: computed(() => metaData.value.statuses),

        isMetaFetching,
        metaError,
        fetchRoomMeta
    };
}