<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoom } from '@/composables/useRoom';
import { useRoomFilter } from '@/composables/useRoomFilter';
import { usePagination } from '@/composables/usePagination';

import BaseButton from '@/components/common/BaseButton.vue';
import RoomFilterBar from '@/components/rooms/RoomFilterBar.vue';
import RoomTable from '@/components/rooms/RoomTable.vue';
import AppPagination from '@/components/common/AppPagination.vue';
import AppConfirmModal from '@/components/common/AppConfirmModal.vue';
import AppSuccessModal from '@/components/common/AppSuccessModal.vue';

function scrollToTop() {
    const scrollContainer = document.querySelector('main') || document.querySelector('.overflow-y-auto') || document.documentElement;

    scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
}

const { rooms, isFetching, error, totalCount, fetchRooms, deleteRoom, navigateToCreate, navigateToEdit } = useRoom();

const { currentPage, perPage, setPage, resetPage } = usePagination(10, newPage => {
    loadRooms(newPage);
    setTimeout(() => {
        scrollToTop();
    }, 50);
});

const { roomType, floor, minPrice, maxPrice, status, resetFilters, getCleanParams } = useRoomFilter(() => {
    resetPage();
    loadRooms(1);
});

const totalPages = computed(() => {
    return Math.ceil(totalCount.value / perPage.value) || 1;
});

const selectedRoomIds = ref([]);
const isDeleteModalOpen = ref(false);
const roomToDelete = ref(null);
const isBulkDelete = ref(false);

const isSuccessModalOpen = ref(false);
const successModalTitle = ref('Success!');
const successModalMessage = ref('Action completed successfully.');

async function loadRooms(page = currentPage.value) {
    const params = {
        page,
        limit: perPage.value,
        ...getCleanParams(),
    };
    await fetchRooms(page, params);
}

function handleView(room) {
    console.log('View room details:', room);
}

function handleEdit(room) {
    navigateToEdit(room.id);
}

function handleDeleteClick(room = null) {
    if (room) {
        roomToDelete.value = room;
        isBulkDelete.value = false;
    } else {
        roomToDelete.value = null;
        isBulkDelete.value = true;
    }
    isDeleteModalOpen.value = true;
}

async function confirmDeleteRoom() {
    let success = false;
    let deletedCount = 0;
    const wasLastItemOnPage = rooms.value.length === (isBulkDelete.value ? selectedRoomIds.value.length : 1);

    if (isBulkDelete.value) {
        if (selectedRoomIds.value.length === 0) return;
        deletedCount = selectedRoomIds.value.length;
        success = await deleteRoom(selectedRoomIds.value);
    } else {
        if (!roomToDelete.value) return;
        deletedCount = 1;
        success = await deleteRoom(roomToDelete.value.id);
    }

    isDeleteModalOpen.value = false;

    if (success) {
        const roomText = deletedCount > 1 ? 'rooms' : 'room';
        successModalTitle.value = 'Success!';
        successModalMessage.value = isBulkDelete.value ? `${deletedCount} ${roomText} have been deleted.` : `Room ${roomToDelete.value?.name || ''} deleted successfully.`;
        isSuccessModalOpen.value = true;

        selectedRoomIds.value = [];

        let targetPage = currentPage.value;
        if (wasLastItemOnPage && targetPage > 1) {
            targetPage -= 1;
        }

        if (targetPage !== currentPage.value) {
            setPage(targetPage, totalCount.value);
        } else {
            await loadRooms(targetPage);
        }
    }

    roomToDelete.value = null;
    isBulkDelete.value = false;
}

function handleExport() {
    console.log('Exporting room data...');
}

onMounted(() => {
    loadRooms(currentPage.value);
});
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-16">
            <div class="flex flex-col gap-1">
                <h1 class="text-h2 text-text-primary tracking-tight">Room List</h1>
                <p class="text-body-lg text-text-secondary">Manage your Room.</p>
            </div>

            <div class="flex items-center gap-2">
                <BaseButton v-if="selectedRoomIds.length > 0" variant="danger" size="md" @click="handleDeleteClick(null)">
                    <template #icon-left>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </template>
                    Delete Selected ({{ selectedRoomIds.length }})
                </BaseButton>

                <BaseButton variant="secondary" size="md" @click="handleExport">
                    <template #icon-left>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                    </template>
                    Export Data
                </BaseButton>

                <BaseButton variant="primary" size="md" @click="navigateToCreate">
                    <template #icon-left>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
                        </svg>
                    </template>
                    Add Room
                </BaseButton>
            </div>
        </div>

        <div class="mb-6">
            <RoomFilterBar v-model:room-type="roomType" v-model:floor="floor" v-model:min-price="minPrice" v-model:max-price="maxPrice" v-model:status="status" @reset="resetFilters" />
        </div>

        <div v-if="error" class="mb-6 p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between">
            <span class="text-body-md">{{ error }}</span>
            <button @click="loadRooms()" class="text-sm font-semibold cursor-pointer">Retry</button>
        </div>

        <div class="overflow-hidden mb-8">
            <RoomTable :rooms="rooms" :is-loading="isFetching" v-model:selected-room-ids="selectedRoomIds" @view="handleView" @edit="handleEdit" @delete="handleDeleteClick" />
        </div>

        <div v-if="totalCount > 0" class="flex items-center justify-between">
            <p class="text-body-sm text-text-secondary pl-2">
                Showing page <span class="font-semibold text-text-primary">{{ currentPage }}</span> of <span class="font-semibold text-text-primary">{{ totalPages }}</span> (<span
                    class="font-semibold text-text-primary"
                    >{{ totalCount }}</span
                >
                total rooms)
            </p>
            <AppPagination v-model="currentPage" :total-pages="totalPages" />
        </div>

        <AppConfirmModal
            :is-open="isDeleteModalOpen"
            title="Delete Room?"
            :message="
                isBulkDelete
                    ? `Are you sure you want to delete ${selectedRoomIds.length} selected rooms? This action cannot be undone.`
                    : `Are you sure you want to delete room ${roomToDelete?.name || ''}? This action cannot be undone.`
            "
            confirm-text="Delete"
            cancel-text="Cancel"
            @close="isDeleteModalOpen = false"
            @confirm="confirmDeleteRoom"
        />

        <AppSuccessModal :is-open="isSuccessModalOpen" :title="successModalTitle" :message="successModalMessage" @close="isSuccessModalOpen = false" />
    </div>
</template>
