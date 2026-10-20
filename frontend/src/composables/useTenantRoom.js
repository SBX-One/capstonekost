import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useTenantRoomStore } from '@/stores/tenantRoomStore';

export function useTenantRoom() {
    const tenantRoomStore = useTenantRoomStore();
    const router = useRouter();

    const {
        roomMap,
        rooms,
        isFetching,
        error,
        totalCount,
        totalRooms
    } = storeToRefs(tenantRoomStore);

    function navigateToDetail(id) {
        router.push({ name: 'tenant-room-detail', params: { id } });
    }

    function formatRupiah(price) {
        if (!price && price !== 0) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(price);
    }


    return {
        roomMap,
        rooms,
        isFetching,
        error,
        totalCount,
        totalRooms,

        getRoomById: tenantRoomStore.getRoomById,
        fetchTenantRooms: tenantRoomStore.fetchTenantRooms,
        fetchTenantRoomById: tenantRoomStore.fetchTenantRoomById,
        clearCache: tenantRoomStore.clearCache,

        navigateToDetail,
        formatRupiah
    };
}